import { getDecisionDisplay, type RiskProfile } from "./risk-profile"

type PdfCommand = string
type PdfPage = PdfCommand[]
type Rgb = [number, number, number]

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 42
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const FOOTER_Y = 30

const COLORS = {
  ink: [0.09, 0.11, 0.14] as Rgb,
  muted: [0.39, 0.43, 0.48] as Rgb,
  border: [0.86, 0.88, 0.9] as Rgb,
  panel: [0.97, 0.98, 0.98] as Rgb,
  header: [0.1, 0.19, 0.17] as Rgb,
  green: [0.12, 0.48, 0.36] as Rgb,
  red: [0.65, 0.12, 0.11] as Rgb,
  yellow: [0.55, 0.42, 0.12] as Rgb,
  softGreen: [0.9, 0.97, 0.94] as Rgb,
  softRed: [0.99, 0.92, 0.92] as Rgb,
  softYellow: [0.99, 0.96, 0.86] as Rgb,
  white: [1, 1, 1] as Rgb,
}

const cleanReportText = (value: string) =>
  value
    .replace(/\s?\(pengaruh [^)]+\)/gi, "")
    .replace(/,\s?pengaruh [+-]?\d+(\.\d+)?/gi, "")
    .replace(/dengan kekuatan pengaruh [+-]?\d+(\.\d+)?/gi, "dalam keputusan model")
    .replace(/\bSHAP\b/gi, "pengaruh model")
    .replace(/\bdriver\b/gi, "faktor")
    .replace(/\bbackend\b/gi, "sistem")
    .replace(/\bkalkulasi frontend\b/gi, "analisis aplikasi")
    .replace(/\bSkor ML\b/gi, "Skor model")
    .replace(/\bprobabilitas kelas\b/gi, "tingkat keyakinan")

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

const formatCurrency = (value: number) =>
  `Rp ${Math.round(value).toLocaleString("id-ID")}`

const sanitizePdfText = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const escapePdfText = (value: string) =>
  sanitizePdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")

const rgb = ([r, g, b]: Rgb) => `${r} ${g} ${b}`

function wrapText(text: string, maxWidth: number, fontSize: number) {
  const maxChars = Math.max(12, Math.floor(maxWidth / (fontSize * 0.52)))
  const words = sanitizePdfText(text).split(" ")
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines
}

class PdfBuilder {
  private pages: PdfPage[] = [[]]
  private y = PAGE_HEIGHT - MARGIN

  private get page() {
    return this.pages[this.pages.length - 1]
  }

  currentY() {
    return this.y
  }

  addPage() {
    this.drawFooter()
    this.pages.push([])
    this.y = PAGE_HEIGHT - MARGIN
  }

  ensureSpace(height: number) {
    if (this.y - height < 62) {
      this.addPage()
    }
  }

  moveDown(amount: number) {
    this.y -= amount
  }

  rect(x: number, y: number, width: number, height: number, fill?: Rgb, stroke?: Rgb) {
    if (fill) {
      this.page.push(`q ${rgb(fill)} rg ${x} ${y} ${width} ${height} re f Q`)
    }
    if (stroke) {
      this.page.push(`q ${rgb(stroke)} RG 0.7 w ${x} ${y} ${width} ${height} re S Q`)
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, color = COLORS.border) {
    this.page.push(`q ${rgb(color)} RG 0.7 w ${x1} ${y1} m ${x2} ${y2} l S Q`)
  }

  text(
    value: string,
    x: number,
    y: number,
    options: {
      size?: number
      font?: "F1" | "F2" | "F3"
      color?: Rgb
      leading?: number
      maxWidth?: number
    } = {}
  ) {
    const size = options.size ?? 10
    const font = options.font ?? "F1"
    const color = options.color ?? COLORS.ink
    const lines = options.maxWidth
      ? wrapText(value, options.maxWidth, size)
      : [sanitizePdfText(value)]
    const leading = options.leading ?? size + 4

    lines.forEach((line, index) => {
      this.page.push(
        `BT ${rgb(color)} rg /${font} ${size} Tf ${x} ${y - index * leading} Td (${escapePdfText(line)}) Tj ET`
      )
    })

    return lines.length * leading
  }

  sectionTitle(title: string) {
    this.ensureSpace(34)
    this.moveDown(18)
    this.text(title.toUpperCase(), MARGIN, this.y, {
      size: 9,
      font: "F2",
      color: COLORS.green,
    })
    this.line(MARGIN, this.y - 8, PAGE_WIDTH - MARGIN, this.y - 8, COLORS.border)
    this.moveDown(22)
  }

  paragraph(text: string, maxWidth = CONTENT_WIDTH) {
    const lines = wrapText(cleanReportText(text), maxWidth, 10)
    this.ensureSpace(lines.length * 15 + 4)
    lines.forEach((line) => {
      this.text(line, MARGIN, this.y, { size: 10, color: COLORS.ink })
      this.moveDown(15)
    })
  }

  keyValueRows(rows: Array<[string, string]>, x: number, width: number) {
    const rowHeight = 22
    this.ensureSpace(rows.length * rowHeight + 10)

    rows.forEach(([label, value], index) => {
      const y = this.y - index * rowHeight
      this.rect(x, y - 16, width, rowHeight, index % 2 === 0 ? COLORS.panel : COLORS.white)
      this.text(label, x + 12, y - 6, { size: 8, font: "F2", color: COLORS.muted })
      this.text(value, x + width * 0.42, y - 6, {
        size: 9,
        color: COLORS.ink,
        maxWidth: width * 0.54,
      })
    })

    this.rect(x, this.y - rows.length * rowHeight + 6, width, rows.length * rowHeight, undefined, COLORS.border)
    this.moveDown(rows.length * rowHeight + 12)
  }

  summaryCard(label: string, value: string, helper: string, x: number, y: number, width: number, color: Rgb) {
    this.rect(x, y, width, 68, COLORS.white, COLORS.border)
    this.rect(x, y + 56, width, 12, color)
    this.text(label, x + 12, y + 44, { size: 8, font: "F2", color: COLORS.muted })
    this.text(value, x + 12, y + 24, { size: 17, font: "F2", color: COLORS.ink, maxWidth: width - 24 })
    this.text(helper, x + 12, y + 10, { size: 8, color: COLORS.muted, maxWidth: width - 24 })
  }

  table(
    headers: string[],
    rows: string[][],
    columnWidths: number[],
    options: { fontSize?: number; rowHeight?: number } = {}
  ) {
    const rowHeight = options.rowHeight ?? 26
    const fontSize = options.fontSize ?? 8.5
    const tableWidth = columnWidths.reduce((total, width) => total + width, 0)
    this.ensureSpace((rows.length + 1) * rowHeight + 10)

    this.rect(MARGIN, this.y - rowHeight + 7, tableWidth, rowHeight, COLORS.header)
    let cursorX = MARGIN
    headers.forEach((header, index) => {
      this.text(header, cursorX + 8, this.y - 9, {
        size: 8,
        font: "F2",
        color: COLORS.white,
        maxWidth: columnWidths[index] - 14,
      })
      cursorX += columnWidths[index]
    })
    this.moveDown(rowHeight)

    rows.forEach((row, rowIndex) => {
      this.ensureSpace(rowHeight + 14)
      this.rect(
        MARGIN,
        this.y - rowHeight + 7,
        tableWidth,
        rowHeight,
        rowIndex % 2 === 0 ? COLORS.panel : COLORS.white,
        COLORS.border
      )
      cursorX = MARGIN
      row.forEach((cell, index) => {
        this.text(cell, cursorX + 8, this.y - 9, {
          size: fontSize,
          color: COLORS.ink,
          maxWidth: columnWidths[index] - 14,
        })
        cursorX += columnWidths[index]
      })
      this.moveDown(rowHeight)
    })

    this.moveDown(8)
  }

  bullets(items: string[]) {
    items.forEach((item) => {
      const lines = wrapText(cleanReportText(item), CONTENT_WIDTH - 18, 9.5)
      this.ensureSpace(lines.length * 14 + 6)
      this.text("-", MARGIN, this.y, { size: 10, font: "F2", color: COLORS.green })
      lines.forEach((line, index) => {
        this.text(line, MARGIN + 16, this.y - index * 14, {
          size: 9.5,
          color: COLORS.ink,
        })
      })
      this.moveDown(lines.length * 14 + 5)
    })
  }

  drawHeader(profile: RiskProfile) {
    this.rect(0, PAGE_HEIGHT - 118, PAGE_WIDTH, 118, COLORS.header)
    this.text("RISK PROFILER UMKM", MARGIN, PAGE_HEIGHT - 52, {
      size: 20,
      font: "F2",
      color: COLORS.white,
    })
    this.text("Laporan Analisis Risiko Pembiayaan", MARGIN, PAGE_HEIGHT - 73, {
      size: 11,
      color: [0.84, 0.91, 0.88],
    })
    this.text(`Application ID: ${profile.id}`, MARGIN, PAGE_HEIGHT - 94, {
      size: 9,
      color: [0.84, 0.91, 0.88],
    })
    this.text(formatDate(new Date()), PAGE_WIDTH - 205, PAGE_HEIGHT - 52, {
      size: 9,
      font: "F2",
      color: COLORS.white,
      maxWidth: 160,
    })
    this.text("Generated by Risk Profiling ML API", PAGE_WIDTH - 205, PAGE_HEIGHT - 72, {
      size: 8,
      color: [0.84, 0.91, 0.88],
      maxWidth: 160,
    })
    this.y = PAGE_HEIGHT - 145
  }

  drawFooter() {
    const pageNumber = this.pages.length
    this.line(MARGIN, FOOTER_Y + 20, PAGE_WIDTH - MARGIN, FOOTER_Y + 20, COLORS.border)
    this.text("Laporan ini dihasilkan otomatis untuk kebutuhan review analis.", MARGIN, FOOTER_Y + 5, {
      size: 7.5,
      color: COLORS.muted,
    })
    this.text(`Halaman ${pageNumber}`, PAGE_WIDTH - 88, FOOTER_Y + 5, {
      size: 7.5,
      color: COLORS.muted,
    })
  }

  finish() {
    this.drawFooter()
    return this.pages
  }
}

function riskColor(profile: RiskProfile): Rgb {
  if (profile.risk === "Low Risk") return COLORS.green
  if (profile.risk === "Medium Risk") return COLORS.yellow
  return COLORS.red
}

function statusColor(status: string): Rgb {
  const normalized = status.toLowerCase()
  if (normalized.includes("approved")) return COLORS.green
  if (normalized.includes("rejected")) return COLORS.red
  if (normalized.includes("revision")) return COLORS.yellow
  return COLORS.muted
}

function buildPdfPages(profile: RiskProfile) {
  const pdf = new PdfBuilder()
  const decision = getDecisionDisplay(profile.status)
  const merchantId = profile.input.merchant_id
  const generatedAt = formatDate(new Date())

  pdf.drawHeader(profile)

  const cardGap = 10
  const cardWidth = (CONTENT_WIDTH - cardGap * 3) / 4
  const cardY = pdf.currentY() - 68
  pdf.summaryCard("Skor Risiko", `${profile.score}/100`, profile.riskLabel, MARGIN, cardY, cardWidth, riskColor(profile))
  pdf.summaryCard("Band", `${profile.band}`, profile.bandRange, MARGIN + (cardWidth + cardGap), cardY, cardWidth, COLORS.green)
  pdf.summaryCard("Confidence", profile.confidence, `${Math.round(profile.probability * 100)}% keyakinan`, MARGIN + (cardWidth + cardGap) * 2, cardY, cardWidth, COLORS.header)
  pdf.summaryCard("Plafon", formatCurrency(profile.limit), "Rekomendasi sistem", MARGIN + (cardWidth + cardGap) * 3, cardY, cardWidth, COLORS.yellow)
  pdf.moveDown(92)

  pdf.sectionTitle("Ringkasan Eksekutif")
  pdf.paragraph(
    `${profile.name} dinilai dalam kategori ${profile.riskLabel} dengan skor ${profile.score}/100 dan Band ${profile.band}. Rekomendasi plafon pembiayaan saat ini adalah ${formatCurrency(profile.limit)}. Status keputusan terbaru: ${decision.title}.`
  )

  if (profile.decisionNote) {
    pdf.ensureSpace(58)
    const decisionBoxY = pdf.currentY()
    pdf.rect(MARGIN, decisionBoxY - 52, CONTENT_WIDTH, 52, profile.status.includes("Rejected") ? COLORS.softRed : profile.status.includes("Revision") ? COLORS.softYellow : COLORS.softGreen, COLORS.border)
    pdf.text(decision.title, MARGIN + 14, decisionBoxY - 17, {
      size: 11,
      font: "F2",
      color: statusColor(profile.status),
    })
    pdf.text(profile.decisionNote, MARGIN + 14, decisionBoxY - 35, {
      size: 9,
      color: COLORS.ink,
      maxWidth: CONTENT_WIDTH - 28,
    })
    pdf.moveDown(68)
  }

  pdf.sectionTitle("Profil Pengajuan")
  pdf.keyValueRows(
    [
      ["Nama UMKM", profile.name],
      ["Application ID", profile.id],
      ["Merchant ID", merchantId],
      ["Kategori Usaha", profile.category.toUpperCase()],
      ["Tanggal Analisis", formatDate(profile.createdAt)],
      ["Tanggal Cetak", generatedAt],
      ["Status Keputusan", decision.title],
      ["Plafon Rekomendasi", formatCurrency(profile.limit)],
      ...(profile.revisionLimit ? [["Plafon Revisi", formatCurrency(profile.revisionLimit)] as [string, string]] : []),
    ],
    MARGIN,
    CONTENT_WIDTH
  )

  pdf.sectionTitle("Penjelasan Model")
  pdf.paragraph(profile.aiExplanation)

  pdf.sectionTitle("Faktor Utama Model")
  pdf.table(
    ["Faktor", "Peran", "Nilai", "Kekuatan"],
    profile.shapDrivers.slice(0, 6).map((driver) => [
      driver.label,
      driver.role === "supporting" ? "Faktor utama" : "Penyeimbang",
      driver.value,
      `${driver.strength}%`,
    ]),
    [190, 110, 140, 73]
  )

  pdf.sectionTitle("Data Input")
  pdf.keyValueRows(
    [
      ["Usia usaha", `${profile.input.business_age_months} bulan`],
      ["Volume QRIS bulanan", formatCurrency(profile.input.qris_volume_monthly)],
      ["Hari aktif QRIS", `${profile.input.qris_active_days} hari`],
      ["Rating e-commerce", `${profile.input.ecommerce_rating}`],
      ["Keterlambatan PLN", `${profile.input.pln_delay_days} hari`],
      ["Rata-rata tagihan PDAM", formatCurrency(profile.input.pdam_bill_avg)],
      ["Keterlambatan PDAM", `${profile.input.pdam_late_payments} kali`],
    ],
    MARGIN,
    CONTENT_WIDTH
  )

  pdf.sectionTitle("Breakdown Kontribusi")
  pdf.table(
    ["Kategori", "Dampak", "Bobot", "Keterangan"],
    profile.breakdown.map((item) => [
      item.title,
      item.points,
      item.weight,
      cleanReportText(item.description),
    ]),
    [132, 88, 112, 181],
    { fontSize: 8, rowHeight: 32 }
  )

  pdf.sectionTitle("Rekomendasi Analis")
  pdf.bullets(profile.recommendations)

  pdf.sectionTitle("Catatan Penggunaan")
  pdf.paragraph(
    "Laporan ini merupakan ringkasan hasil scoring otomatis dan perlu digunakan bersama kebijakan pembiayaan, verifikasi dokumen, serta pertimbangan analis yang berwenang."
  )

  return pdf.finish()
}

function buildPdfDocument(pages: PdfPage[]) {
  const objects: string[] = []
  const pageObjectIds: number[] = []

  objects.push("<< /Type /Catalog /Pages 2 0 R >>")
  objects.push("")
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>")

  pages.forEach((page) => {
    const pageObjectId = objects.length + 1
    const contentObjectId = pageObjectId + 1
    pageObjectIds.push(pageObjectId)

    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObjectId} 0 R >>`
    )
    const stream = page.join("\n")
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
  })

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${pages.length} >>`

  let pdf = "%PDF-1.4\n"
  const offsets = [0]

  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += `startxref\n${xrefOffset}\n%%EOF`

  return pdf
}

export function downloadRiskReportPdf(profile: RiskProfile) {
  const pages = buildPdfPages(profile)
  const pdf = buildPdfDocument(pages)
  const blob = new Blob([pdf], { type: "application/pdf" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `risk-report-${profile.id}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
