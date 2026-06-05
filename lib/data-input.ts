import * as z from "zod"

const requiredIntegerNumber = (field: string) =>
    z
        .string()
        .min(1, `${field} wajib diisi`)
        .transform((val) => val.replace(/\D/g, ""))
        .refine((val) => val.length > 0, {
            message: `${field} harus berupa angka`,
        })
        .transform((val) => Number(val))

const requiredDecimalNumber = (field: string) =>
    z
        .string()
        .min(1, `${field} wajib diisi`)
        .transform((val) => val.replace(",", "."))
        .refine((val) => !Number.isNaN(Number(val)), {
            message: `${field} harus berupa angka`,
        })
        .transform((val) => Number(val))

const requiredCurrencyNumber = (field: string) =>
    z
        .string()
        .min(1, `${field} wajib diisi`)
        .transform((val) => val.replace(/\D/g, ""))
        .refine((val) => val.length > 0, {
            message: `${field} harus berupa angka`,
        })
        .transform((val) => Number(val))

export function parseDateInput(value: string) {
    const [year, month, day] = value.split("-").map(Number)

    if (!year || !month || !day) {
        return null
    }

    const date = new Date(year, month - 1, day)

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null
    }

    return date
}

export function calculateAgeInMonths(startDate: Date, referenceDate = new Date()) {
    let months =
        (referenceDate.getFullYear() - startDate.getFullYear()) * 12 +
        referenceDate.getMonth() -
        startDate.getMonth()

    if (referenceDate.getDate() < startDate.getDate()) {
        months -= 1
    }

    return Math.max(0, months)
}

const requiredBusinessStartDate = z
    .string()
    .min(1, "Tanggal mulai usaha wajib diisi")
    .refine((val) => parseDateInput(val) !== null, {
        message: "Tanggal mulai usaha tidak valid",
    })
    .refine((val) => {
        const date = parseDateInput(val)

        return date !== null && date <= new Date()
    }, "Tanggal mulai usaha tidak boleh di masa depan")
    .transform((val) => calculateAgeInMonths(parseDateInput(val) as Date))

export const formSchema = z
    .object({
        name: z.string().min(1, "Nama UMKM tidak boleh kosong."),
        business_category: z
            .string()
            .min(1, "Kategori bisnis tidak boleh kosong."),
        business_category_custom: z.string().optional(),
        business_age_months: requiredBusinessStartDate,
        qris_volume_monthly: requiredCurrencyNumber("Volume QRIS bulanan").pipe(
            z.number().min(0, "Volume QRIS tidak boleh negatif")
        ),
        qris_active_days: requiredIntegerNumber("Hari aktif QRIS").pipe(
            z.number().min(0).max(31, "Hari aktif QRIS maksimal 31")
        ),
        ecommerce_rating: requiredDecimalNumber("Rating e-commerce").pipe(
            z.number().min(0).max(5, "Rating maksimal 5")
        ),
        pln_delay_days: requiredIntegerNumber("Keterlambatan PLN").pipe(
            z.number().min(0, "Keterlambatan tidak boleh negatif")
        ),
        pdam_bill_avg: requiredCurrencyNumber("Rata-rata tagihan PDAM").pipe(
            z.number().min(0, "Tagihan PDAM tidak boleh negatif")
        ),
        pdam_late_payments: requiredIntegerNumber("Keterlambatan PDAM").pipe(
            z.number().min(0, "Keterlambatan PDAM tidak boleh negatif")
        ),
    })
    .superRefine((data, ctx) => {
        if (
            data.business_category === "lainnya" &&
            !data.business_category_custom?.trim()
        ) {
            ctx.addIssue({
                code: "custom",
                message: "Kategori lainnya wajib diisi",
                path: ["business_category_custom"],
            })
        }
    })

export type FormValidation = z.infer<typeof formSchema>
export type FormInput = z.input<typeof formSchema>
export type FormOutput = z.output<typeof formSchema>

export const categories = ["fnb", "retail", "fashion", "jasa", "lainnya"]

export const categoryLabels: Record<string, string> = {
    fnb: "FNB",
    retail: "Retail",
    fashion: "Fashion",
    jasa: "Jasa",
    lainnya: "Lainnya",
}

export type FieldInfo = {
    title: string
    summary: string
    detail: string
}

export const fieldInfo = {
    name: {
        title: "Nama UMKM",
        summary: "Nama usaha yang akan muncul di profil risiko.",
        detail:
            "Gunakan nama usaha yang dikenal nasabah atau tercatat di kanal operasional. Nama ini dipakai untuk identifikasi profil, bukan sebagai faktor perhitungan skor risiko.",
    },
    business_category: {
        title: "Kategori Bisnis",
        summary: "Jenis usaha utama yang paling mewakili aktivitas UMKM.",
        detail:
            "Kategori membantu model membaca pola risiko berdasarkan sektor. Pilih FNB untuk makanan dan minuman, retail untuk penjualan barang harian, fashion untuk pakaian atau aksesori, jasa untuk layanan seperti bengkel atau salon, dan lainnya jika sektor UMKM tidak tersedia di daftar.",
    },
    business_age_months: {
        title: "Tanggal Mulai Usaha",
        summary: "Pilih tanggal saat usaha mulai beroperasi.",
        detail:
            "Tanggal ini otomatis dikonversi menjadi usia usaha dalam bulan saat data dikirim ke model. Usia usaha memberi sinyal stabilitas operasional. Pilih tanggal mulai yang paling mendekati kondisi sebenarnya.",
    },
    qris_volume_monthly: {
        title: "Volume QRIS Bulanan",
        summary: "Total nominal transaksi QRIS dalam satu bulan.",
        detail:
            "QRIS adalah kanal pembayaran digital berbasis kode QR. Field ini berisi total rupiah transaksi QRIS bulanan, misalnya 5000000 untuk Rp 5.000.000. Nilai ini membantu mengukur arus kas digital UMKM.",
    },
    qris_active_days: {
        title: "Hari Aktif QRIS",
        summary: "Jumlah hari dalam sebulan ketika ada transaksi QRIS.",
        detail:
            "Hari aktif QRIS menunjukkan konsistensi transaksi digital. Jika dalam satu bulan ada transaksi QRIS pada 22 hari berbeda, isi 22. Nilai maksimalnya 31.",
    },
    ecommerce_rating: {
        title: "Rating E-Commerce",
        summary: "Rata-rata rating toko atau produk di marketplace.",
        detail:
            "Isi dengan rating 0 sampai 5 dari kanal e-commerce utama. Rating tinggi biasanya menandakan reputasi layanan yang lebih baik, sedangkan 0 dapat digunakan jika UMKM belum memiliki kanal e-commerce.",
    },
    pln_delay_days: {
        title: "Keterlambatan PLN",
        summary: "Total hari keterlambatan pembayaran listrik.",
        detail:
            "PLN merujuk pembayaran listrik. Field ini membaca kedisiplinan pembayaran utilitas. Isi 0 jika pembayaran listrik selalu tepat waktu.",
    },
    pdam_bill_avg: {
        title: "Rata-rata Tagihan PDAM",
        summary: "Rata-rata tagihan air bulanan dalam rupiah.",
        detail:
            "PDAM merujuk tagihan air. Masukkan rata-rata nominal tagihan per bulan, misalnya 150000 untuk Rp 150.000. Jika usaha tidak menggunakan PDAM, isi 0.",
    },
    pdam_late_payments: {
        title: "Keterlambatan PDAM",
        summary: "Jumlah pembayaran PDAM yang terlambat.",
        detail:
            "Field ini menghitung frekuensi keterlambatan pembayaran air. Isi 0 jika tidak pernah terlambat atau tidak menggunakan PDAM.",
    },
} satisfies Record<string, FieldInfo>

export function createMerchantId() {
    return `UMKM-${Date.now().toString(36).toUpperCase()}`
}

export function normalizeCategory(category: string) {
    const normalized = category.toLowerCase().trim()
    const aliases: Record<string, string> = {
        "f & b": "fnb",
        "f&b": "fnb",
        services: "jasa",
        service: "jasa",
    }

    return aliases[normalized] ?? normalized
}

export function formatDateInput(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

export function formatLongDate(date: Date) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date)
}

export function formatAgeLabel(totalMonths: number) {
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    if (years === 0) {
        return `${months} bulan`
    }

    if (months === 0) {
        return `${years} tahun`
    }

    return `${years} tahun ${months} bulan`
}

export function formatRupiahInput(value: string) {
    const digits = value.replace(/\D/g, "")

    if (!digits) {
        return ""
    }

    return `Rp ${Number(digits).toLocaleString("id-ID")}`
}

export function formatIntegerInput(value: string) {
    const digits = value.replace(/\D/g, "")

    if (!digits) {
        return ""
    }

    return String(Number(digits))
}

export function formatBoundedIntegerInput(value: string, max: number) {
    const formatted = formatIntegerInput(value)

    if (!formatted) {
        return ""
    }

    return String(Math.min(Number(formatted), max))
}

export function formatRatingInput(value: string) {
    const normalized = value.replace(",", ".").replace(/[^\d.]/g, "")
    const [integerPart, ...decimalParts] = normalized.split(".")
    const decimalPart = decimalParts.join("").slice(0, 1)
    const hasDecimalPoint = normalized.includes(".")
    const rating = hasDecimalPoint
        ? `${integerPart || "0"}.${decimalPart}`
        : integerPart

    if (!rating) {
        return ""
    }

    const numberValue = Number(rating)

    if (Number.isNaN(numberValue)) {
        return ""
    }

    if (numberValue > 5) {
        return "5"
    }

    return rating
}

export function formatTextInput(value: string) {
    return value.replace(/\s+/g, " ").trim()
}
