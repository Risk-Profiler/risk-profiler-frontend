"use client"

import {
    ArrowRight,
    BookOpen,
    Building2,
    CalendarDays,
    Check,
    ChevronDown,
    CircleAlert,
    Info,
    Loader2,
    ReceiptText,
    WalletCards,
    X,
    Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { requestRiskPrediction } from "@/lib/api"
import {
    createRiskProfile,
} from "@/lib/risk-profile"
import {
    savePredictionResult,
    saveSelectedProfile,
    upsertProfile,
} from "@/lib/risk-storage"

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

function parseDateInput(value: string) {
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

function calculateAgeInMonths(startDate: Date, referenceDate = new Date()) {
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

const formSchema = z
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

type FormValidation = z.infer<typeof formSchema>

const categories = ["fnb", "retail", "fashion", "jasa", "lainnya"]

const categoryLabels: Record<string, string> = {
    fnb: "FNB",
    retail: "Retail",
    fashion: "Fashion",
    jasa: "Jasa",
    lainnya: "Lainnya",
}

type FieldInfo = {
    title: string
    summary: string
    detail: string
}

const fieldInfo = {
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

function createMerchantId() {
    return `UMKM-${Date.now().toString(36).toUpperCase()}`
}

function normalizeCategory(category: string) {
    const normalized = category.toLowerCase().trim()
    const aliases: Record<string, string> = {
        "f & b": "fnb",
        "f&b": "fnb",
        services: "jasa",
        service: "jasa",
    }

    return aliases[normalized] ?? normalized
}

function formatDateInput(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}

function formatLongDate(date: Date) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date)
}

function formatAgeLabel(totalMonths: number) {
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

function formatRupiahInput(value: string) {
    const digits = value.replace(/\D/g, "")

    if (!digits) {
        return ""
    }

    return `Rp ${Number(digits).toLocaleString("id-ID")}`
}

function formatIntegerInput(value: string) {
    const digits = value.replace(/\D/g, "")

    if (!digits) {
        return ""
    }

    return String(Number(digits))
}

function formatBoundedIntegerInput(value: string, max: number) {
    const formatted = formatIntegerInput(value)

    if (!formatted) {
        return ""
    }

    return String(Math.min(Number(formatted), max))
}

function formatRatingInput(value: string) {
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

function formatTextInput(value: string) {
    return value.replace(/\s+/g, " ").trim()
}

export default function InputPage() {
    const router = useRouter()
    const [activeInfo, setActiveInfo] = useState<FieldInfo | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<
        z.input<typeof formSchema>,
        unknown,
        z.output<typeof formSchema>
    >({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            business_category: "",
            business_category_custom: "",
            business_age_months: "",
            qris_volume_monthly: "",
            qris_active_days: "",
            ecommerce_rating: "",
            pln_delay_days: "",
            pdam_bill_avg: "Rp 0",
            pdam_late_payments: "0",
        },
    })

    const selectedCategory = useWatch({
        control,
        name: "business_category",
    })
    const businessStartDate = useWatch({
        control,
        name: "business_age_months",
    })
    const todayInputValue = formatDateInput(new Date())

    const onSubmit = async (data: FormValidation) => {
        const { business_category_custom, ...modelData } = data
        const selectedBusinessCategory =
            data.business_category === "lainnya"
                ? business_category_custom ?? ""
                : data.business_category
        const payload = {
            merchant_id: createMerchantId(),
            ...modelData,
            business_category: normalizeCategory(selectedBusinessCategory),
        }

        let result

        try {
            result = await requestRiskPrediction(payload)
        } catch (error) {
            console.error("Prediction server failed:", error)
            toast.error("Server analisis tidak merespons", {
                description:
                    "Pastikan API analisis berjalan sebelum membuat profil risiko.",
            })
            return
        }

        const profile = createRiskProfile(payload, result)

        savePredictionResult(profile)
        saveSelectedProfile(profile)
        upsertProfile(profile)

        toast.success("Profil risiko berhasil dibuat", {
            description: `${profile.name} mendapatkan skor ${profile.score}/100 dan plafon Rp ${profile.limit.toLocaleString("id-ID")}.`,
        })

        router.push("/details")
    }

    return (
        <main className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-5">
                <section className="rounded-2xl border bg-background p-5 sm:p-6">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-light-green-accent text-green-accent">
                            <WalletCards size={22} />
                        </div>

                        <div className="min-w-0">
                            <h1 className="break-words text-2xl font-bold sm:text-3xl">
                                Input Data UMKM
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                Masukkan data operasional untuk membuat profil risiko dan rekomendasi plafon.
                            </p>
                        </div>
                    </div>
                </section>

                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    className="rounded-2xl border bg-background"
                >
                    <div className="divide-y">
                        <FormSection
                            icon={<Building2 size={18} />}
                            title="Profil Usaha"
                        >
                            <FieldError
                                label="Nama UMKM"
                                info={fieldInfo.name}
                                onLearnMore={setActiveInfo}
                                error={errors.name?.message}
                            >
                                <Input
                                    type="text"
                                    placeholder="Contoh: Warung Kopi Sari"
                                    {...register("name", {
                                        onBlur: (event) => {
                                            setValue(
                                                "name",
                                                formatTextInput(event.target.value),
                                                { shouldValidate: true }
                                            )
                                        },
                                    })}
                                />
                            </FieldError>

                            <FieldError
                                label="Kategori Bisnis"
                                info={fieldInfo.business_category}
                                onLearnMore={setActiveInfo}
                                error={
                                    errors.business_category?.message ??
                                    errors.business_category_custom?.message
                                }
                            >
                                <input
                                    type="hidden"
                                    {...register("business_category")}
                                />
                                <CategorySelect
                                    value={selectedCategory}
                                    onChange={(value) =>
                                        setValue("business_category", value, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                    }
                                />
                                {selectedCategory === "lainnya" && (
                                    <Input
                                        type="text"
                                        placeholder="Contoh: percetakan, laundry, bengkel"
                                        className="mt-2"
                                        {...register("business_category_custom", {
                                            onBlur: (event) => {
                                                setValue(
                                                    "business_category_custom",
                                                    formatTextInput(event.target.value),
                                                    { shouldValidate: true }
                                                )
                                            },
                                        })}
                                    />
                                )}
                            </FieldError>

                            <FieldError
                                label="Tanggal Mulai Usaha"
                                info={fieldInfo.business_age_months}
                                onLearnMore={setActiveInfo}
                                error={errors.business_age_months?.message}
                            >
                                <BusinessAgePicker
                                    value={businessStartDate}
                                    max={todayInputValue}
                                    onChange={(value) =>
                                        setValue("business_age_months", value, {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        })
                                    }
                                />
                            </FieldError>
                        </FormSection>

                        <FormSection
                            icon={<ReceiptText size={18} />}
                            title="Transaksi dan Reputasi Digital"
                        >
                            <FieldError
                                label="Volume QRIS Bulanan"
                                info={fieldInfo.qris_volume_monthly}
                                onLearnMore={setActiveInfo}
                                error={errors.qris_volume_monthly?.message}
                            >
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Rp 5.000.000"
                                    {...register("qris_volume_monthly", {
                                        onChange: (event) => {
                                            setValue(
                                                "qris_volume_monthly",
                                                formatRupiahInput(event.target.value),
                                                { shouldValidate: true }
                                            )
                                        },
                                    })}
                                />
                            </FieldError>

                            <FieldError
                                label="Hari Aktif QRIS"
                                info={fieldInfo.qris_active_days}
                                onLearnMore={setActiveInfo}
                                error={errors.qris_active_days?.message}
                            >
                                <InputWithUnit unit="hari">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="22"
                                        className="pr-14"
                                        {...register("qris_active_days", {
                                            onChange: (event) => {
                                                setValue(
                                                    "qris_active_days",
                                                    formatBoundedIntegerInput(
                                                        event.target.value,
                                                        31
                                                    ),
                                                    { shouldValidate: true }
                                                )
                                            },
                                        })}
                                    />
                                </InputWithUnit>
                            </FieldError>

                            <FieldError
                                label="Rating E-Commerce"
                                info={fieldInfo.ecommerce_rating}
                                onLearnMore={setActiveInfo}
                                error={errors.ecommerce_rating?.message}
                            >
                                <InputWithUnit unit="/5">
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="4.8"
                                        className="pr-12"
                                        {...register("ecommerce_rating", {
                                            onChange: (event) => {
                                                setValue(
                                                    "ecommerce_rating",
                                                    formatRatingInput(event.target.value),
                                                    { shouldValidate: true }
                                                )
                                            },
                                        })}
                                    />
                                </InputWithUnit>
                            </FieldError>
                        </FormSection>

                        <FormSection
                            icon={<Zap size={18} />}
                            title="Kedisiplinan Utilitas"
                        >
                            <FieldError
                                label="Keterlambatan PLN (hari)"
                                info={fieldInfo.pln_delay_days}
                                onLearnMore={setActiveInfo}
                                error={errors.pln_delay_days?.message}
                            >
                                <InputWithUnit unit="hari">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="2"
                                        className="pr-14"
                                        {...register("pln_delay_days", {
                                            onChange: (event) => {
                                                setValue(
                                                    "pln_delay_days",
                                                    formatIntegerInput(event.target.value),
                                                    { shouldValidate: true }
                                                )
                                            },
                                        })}
                                    />
                                </InputWithUnit>
                            </FieldError>

                            <FieldError
                                label="Rata-rata Tagihan PDAM"
                                info={fieldInfo.pdam_bill_avg}
                                onLearnMore={setActiveInfo}
                                error={errors.pdam_bill_avg?.message}
                            >
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="Rp 150.000"
                                    {...register("pdam_bill_avg", {
                                        onChange: (event) => {
                                            setValue(
                                                "pdam_bill_avg",
                                                formatRupiahInput(event.target.value),
                                                { shouldValidate: true }
                                            )
                                        },
                                    })}
                                />
                            </FieldError>

                            <FieldError
                                label="Keterlambatan PDAM (kali)"
                                info={fieldInfo.pdam_late_payments}
                                onLearnMore={setActiveInfo}
                                error={errors.pdam_late_payments?.message}
                            >
                                <InputWithUnit unit="kali">
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        className="pr-12"
                                        {...register("pdam_late_payments", {
                                            onChange: (event) => {
                                                setValue(
                                                    "pdam_late_payments",
                                                    formatIntegerInput(event.target.value),
                                                    { shouldValidate: true }
                                                )
                                            },
                                        })}
                                    />
                                </InputWithUnit>
                            </FieldError>
                        </FormSection>
                    </div>

                    <div className="flex flex-col gap-3 border-t bg-muted/25 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <p className="text-sm text-muted-foreground">
                            Profil akan dibuat dan langsung dibuka di halaman detail.
                        </p>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-accent px-5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
                        >
                            {isSubmitting ? (
                                <Loader2 size={17} className="animate-spin" />
                            ) : (
                                <ArrowRight size={17} />
                            )}
                            Generate Risk Profile
                        </button>
                    </div>
                </form>
            </div>

            {activeInfo && (
                <InfoModal
                    info={activeInfo}
                    onClose={() => setActiveInfo(null)}
                />
            )}
        </main>
    )
}

function CategorySelect({
    value,
    onChange,
}: {
    value?: string
    onChange: (value: string) => void
}) {
    const selectedLabel = value ? categoryLabels[value] : "Pilih kategori"

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-between rounded-lg border-input bg-background px-3.5 text-sm font-medium hover:border-green-accent hover:bg-light-green-accent/50 aria-expanded:border-green-accent aria-expanded:bg-light-green-accent/60"
                >
                    <span className={value ? "text-foreground" : "text-muted-foreground"}>
                        {selectedLabel}
                    </span>
                    <ChevronDown
                        size={16}
                        className="ml-2 shrink-0 text-green-accent"
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[min(18rem,calc(100vw-2rem))] p-2"
            >
                <div className="grid gap-1">
                    {categories.map((category) => {
                        const isSelected = value === category

                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => onChange(category)}
                                className="flex h-10 items-center justify-between rounded-lg px-3 text-sm font-medium transition hover:bg-light-green-accent hover:text-green-accent focus:bg-light-green-accent focus:text-green-accent focus:outline-none"
                            >
                                {categoryLabels[category]}
                                {isSelected && (
                                    <Check
                                        size={16}
                                        className="text-green-accent"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}

function BusinessAgePicker({
    value,
    max,
    onChange,
}: {
    value?: string
    max: string
    onChange: (value: string) => void
}) {
    const startDate = value ? parseDateInput(value) : null
    const today = new Date()
    const ageInMonths = startDate
        ? calculateAgeInMonths(startDate, today)
        : null
    const startDateLabel = startDate
        ? formatLongDate(startDate)
        : "Pilih tanggal mulai"
    const ageLabel =
        ageInMonths === null ? "Belum dihitung" : formatAgeLabel(ageInMonths)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-full justify-between rounded-lg border-input bg-background px-3.5 py-3 text-left hover:border-green-accent hover:bg-light-green-accent/50 aria-expanded:border-green-accent aria-expanded:bg-light-green-accent/60"
                >
                    <span className="min-w-0 space-y-1">
                        <span className="block text-xs font-semibold text-green-accent">
                            Tanggal mulai
                        </span>
                        <span className="block truncate text-sm font-semibold text-foreground">
                            {startDateLabel}
                        </span>
                        <span className="block text-xs font-medium text-muted-foreground">
                            Sampai hari ini: {formatLongDate(today)}
                        </span>
                    </span>
                    <CalendarDays
                        size={18}
                        className="ml-3 shrink-0 text-green-accent"
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[min(22rem,calc(100vw-2rem))] border-green-accent/20"
            >
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold">
                            Usia UMKM
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Pilih tanggal mulai usaha. Sistem menghitung usia dari tanggal itu sampai hari ini.
                        </p>
                    </div>

                    <Input
                        type="date"
                        value={value ?? ""}
                        max={max}
                        onChange={(event) => onChange(event.target.value)}
                        className="border-green-accent/30 focus:border-green-accent focus:ring-green-accent/20"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border bg-light-green-accent/45 p-3">
                            <p className="text-[11px] font-semibold uppercase text-green-accent">
                                Sampai
                            </p>
                            <p className="mt-1 text-xs font-medium leading-snug text-foreground">
                                Hari ini
                            </p>
                        </div>
                        <div className="rounded-lg border border-green-accent/20 bg-light-green-accent p-3">
                            <p className="text-[11px] font-semibold uppercase text-green-accent">
                                Usia
                            </p>
                            <p className="mt-1 text-xs font-bold leading-snug text-foreground">
                                {ageLabel}
                            </p>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

function InputWithUnit({
    unit,
    children,
}: {
    unit: string
    children: ReactNode
}) {
    return (
        <div className="relative">
            {children}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-light-green-accent px-1.5 py-0.5 text-xs font-semibold text-green-accent">
                {unit}
            </span>
        </div>
    )
}

function FormSection({
    icon,
    title,
    children,
}: {
    icon: ReactNode
    title: string
    children: ReactNode
}) {
    return (
        <section className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[220px_1fr] lg:gap-8">
            <div className="flex items-center gap-3 lg:items-start">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-light-green-accent text-green-accent">
                    {icon}
                </div>
                <h3 className="text-base font-semibold">
                    {title}
                </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {children}
            </div>
        </section>
    )
}

function FieldError({
    label,
    info,
    onLearnMore,
    error,
    children,
}: {
    label: string
    info: FieldInfo
    onLearnMore: (info: FieldInfo) => void
    error?: string
    children: ReactNode
}) {
    return (
        <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5">
                <label className="text-sm font-semibold">
                    {label}
                </label>
                <FieldHelp info={info} onLearnMore={onLearnMore} />
            </div>

            {children}

            {error && (
                <p className="flex items-start gap-1 text-xs leading-snug text-red-600">
                    <CircleAlert size={14} />
                    {error}
                </p>
            )}
        </div>
    )
}

function FieldHelp({
    info,
    onLearnMore,
}: {
    info: FieldInfo
    onLearnMore: (info: FieldInfo) => void
}) {
    return (
        <div className="group relative flex">
            <button
                type="button"
                aria-label={`Info ${info.title}`}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition hover:bg-light-green-accent hover:text-green-accent focus:bg-light-green-accent focus:text-green-accent focus:outline-none focus:ring-2 focus:ring-green-accent/20"
            >
                <Info size={14} />
            </button>

            <div className="pointer-events-none absolute left-0 top-5 z-30 w-64 translate-y-1 rounded-lg border bg-popover p-3 text-popover-foreground opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {info.summary}
                </p>
                <button
                    type="button"
                    onClick={() => onLearnMore(info)}
                    className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold text-green-accent transition hover:bg-light-green-accent focus:outline-none focus:ring-2 focus:ring-green-accent/20"
                >
                    <BookOpen size={13} />
                    Pelajari lebih lanjut
                </button>
            </div>
        </div>
    )
}

function InfoModal({
    info,
    onClose,
}: {
    info: FieldInfo
    onClose: () => void
}) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="field-info-title"
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-md rounded-xl border bg-background p-5 shadow-xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-green-accent">
                            Panduan Field
                        </p>
                        <h2
                            id="field-info-title"
                            className="mt-1 text-xl font-bold"
                        >
                            {info.title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="Tutup penjelasan"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-green-accent/20"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {info.detail}
                </p>
            </div>
        </div>
    )
}
