import type { RiskProfile } from "./risk-profile"

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")

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

const splitLine = (line: string, maxLength = 88) => {
  if (line.length <= maxLength) return [line]

  const words = line.split(" ")
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length > maxLength) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines
}

function buildReportLines(profile: RiskProfile) {
  return [
    "Risk Profiler - Laporan Analisis Kredit UMKM",
    "",
    `Application ID: ${profile.id}`,
    `Nama UMKM: ${profile.name}`,
    `Kategori: ${profile.category}`,
    `Status: ${profile.status}`,
    `Tanggal Analisis: ${new Date(profile.createdAt).toLocaleDateString("id-ID")}`,
    "",
    "Ringkasan Scoring",
    `Skor Risiko: ${profile.score}/100`,
    `Level Risiko: ${profile.riskLabel}`,
    `Band: ${profile.band} (${profile.bandRange})`,
    `Confidence Model: ${profile.confidence} (${Math.round(profile.probability * 100)}%)`,
    `Plafon Rekomendasi: Rp ${profile.limit.toLocaleString("id-ID")}`,
    profile.revisionLimit
      ? `Plafon Revisi: Rp ${profile.revisionLimit.toLocaleString("id-ID")}`
      : "",
    profile.decisionNote ? `Catatan Keputusan: ${profile.decisionNote}` : "",
    "",
    "Penjelasan Model",
    cleanReportText(profile.aiExplanation),
    ...profile.shapDrivers.map(
      (driver) =>
        `${driver.label}: ${driver.role === "supporting" ? "faktor utama" : "penyeimbang"}, nilai ${driver.value}, kekuatan ${driver.strength}%`
    ),
    "",
    "Input Data",
    `Usia usaha: ${profile.input.business_age_months} bulan`,
    `Volume QRIS bulanan: Rp ${profile.input.qris_volume_monthly.toLocaleString("id-ID")}`,
    `Hari aktif QRIS: ${profile.input.qris_active_days} hari`,
    `Rating e-commerce: ${profile.input.ecommerce_rating}`,
    `Keterlambatan PLN: ${profile.input.pln_delay_days} hari`,
    `Rata-rata tagihan PDAM: Rp ${profile.input.pdam_bill_avg.toLocaleString("id-ID")}`,
    `Keterlambatan PDAM: ${profile.input.pdam_late_payments} kali`,
    "",
    "Breakdown Kontribusi",
    ...profile.breakdown.map((item) => `${item.title}: ${item.points}, ${item.weight}`),
    "",
    "Rekomendasi Sistem",
    ...profile.recommendations.map((item) => `- ${cleanReportText(item)}`),
    "",
    "Catatan",
    "Laporan ini dihasilkan otomatis dari hasil scoring sistem untuk kebutuhan review analis.",
  ].filter(Boolean)
}

export function downloadRiskReportPdf(profile: RiskProfile) {
  const lines = buildReportLines(profile).flatMap((line) => splitLine(line))
  const contentLines = [
    "BT",
    "/F1 11 Tf",
    "50 790 Td",
    "14 TL",
    ...lines.slice(0, 52).map((line, index) => {
      const command = `(${escapePdfText(line)}) Tj`
      return index === lines.length - 1 ? command : `${command} T*`
    }),
    "ET",
  ]

  const stream = contentLines.join("\n")
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]

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
