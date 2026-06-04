"use client"

import { CircleAlert, Loader2, WalletCards } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { toast } from "sonner"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { requestRiskPrediction } from "@/lib/api"
import {
    createRiskProfile,
} from "@/lib/risk-profile"
import {
    savePredictionResult,
    saveSelectedProfile,
    upsertProfile,
} from "@/lib/risk-storage"

const requiredNumber = (field: string) =>
    z
        .string()
        .min(1, `${field} wajib diisi`)
        .refine((val) => !Number.isNaN(Number(val)), {
            message: `${field} harus berupa angka`,
        })
        .transform((val) => Number(val))

const formSchema = z.object({
    name: z.string().min(1, "Nama UMKM tidak boleh kosong."),
    business_category: z
        .string()
        .min(1, "Kategori bisnis tidak boleh kosong."),
    business_age_months: requiredNumber("Usia usaha").pipe(
        z.number().min(0, "Usia usaha tidak boleh negatif")
    ),
    qris_volume_monthly: requiredNumber("Volume QRIS bulanan").pipe(
        z.number().min(0, "Volume QRIS tidak boleh negatif")
    ),
    qris_active_days: requiredNumber("Hari aktif QRIS").pipe(
        z.number().min(0).max(31, "Hari aktif QRIS maksimal 31")
    ),
    ecommerce_rating: requiredNumber("Rating e-commerce").pipe(
        z.number().min(0).max(5, "Rating maksimal 5")
    ),
    pln_delay_days: requiredNumber("Keterlambatan PLN").pipe(
        z.number().min(0, "Keterlambatan tidak boleh negatif")
    ),
    pdam_bill_avg: requiredNumber("Rata-rata tagihan PDAM").pipe(
        z.number().min(0, "Tagihan PDAM tidak boleh negatif")
    ),
    pdam_late_payments: requiredNumber("Keterlambatan PDAM").pipe(
        z.number().min(0, "Keterlambatan PDAM tidak boleh negatif")
    ),
})

type FormValidation = z.infer<typeof formSchema>

const categories = ["fnb", "retail", "fashion", "jasa"]

const fieldClass =
    "w-full rounded-xl border bg-background px-4 py-3 text-sm sm:text-base outline-none transition focus:border-green-accent"

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

export default function InputPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        setValue,
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
            business_age_months: "",
            qris_volume_monthly: "",
            qris_active_days: "",
            ecommerce_rating: "",
            pln_delay_days: "",
            pdam_bill_avg: "0",
            pdam_late_payments: "0",
        },
    })

    const onSubmit = async (data: FormValidation) => {
        const payload = {
            merchant_id: createMerchantId(),
            ...data,
            business_category: normalizeCategory(data.business_category),
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
        <main className="min-h-screen overflow-hidden p-4 sm:p-6 lg:p-8">
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.4fr]">
                <section className="rounded-2xl border bg-background p-6 sm:p-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-light-green-accent text-green-accent">
                        <WalletCards size={24} />
                    </div>

                    <div className="mt-6 space-y-3">
                        <h1 className="break-words text-3xl font-bold sm:text-4xl">
                            Input Data UMKM
                        </h1>

                        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                            Masukkan data operasional untuk membuat profil
                            risiko dan rekomendasi plafon.
                        </p>
                    </div>
                </section>

                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6 rounded-2xl border bg-background p-6 sm:p-8"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h2 className="break-words text-2xl font-bold">
                                Data Pengajuan
                            </h2>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <FieldError
                            label="Nama UMKM"
                            error={errors.name?.message}
                        >
                            <input
                                type="text"
                                placeholder="Contoh: Warung Kopi Sari"
                                className={fieldClass}
                                {...register("name")}
                            />
                        </FieldError>

                        <FieldError
                            label="Kategori Bisnis"
                            error={errors.business_category?.message}
                        >
                            <select
                                className={fieldClass}
                                {...register("business_category")}
                            >
                                <option value="">Pilih kategori</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() =>
                                            setValue(
                                                "business_category",
                                                category,
                                                { shouldValidate: true }
                                            )
                                        }
                                        className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:border-green-accent hover:text-green-accent"
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </FieldError>

                        <FieldError
                            label="Usia Usaha (bulan)"
                            error={errors.business_age_months?.message}
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="24"
                                className={fieldClass}
                                {...register("business_age_months")}
                            />
                        </FieldError>

                        <FieldError
                            label="Volume QRIS Bulanan"
                            error={errors.qris_volume_monthly?.message}
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="5000000"
                                className={fieldClass}
                                {...register("qris_volume_monthly")}
                            />
                        </FieldError>

                        <FieldError
                            label="Hari Aktif QRIS"
                            error={errors.qris_active_days?.message}
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="22"
                                className={fieldClass}
                                {...register("qris_active_days")}
                            />
                        </FieldError>

                        <FieldError
                            label="Rating E-Commerce"
                            error={errors.ecommerce_rating?.message}
                        >
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="4.8"
                                className={fieldClass}
                                {...register("ecommerce_rating")}
                            />
                        </FieldError>

                        <FieldError
                            label="Keterlambatan PLN (hari)"
                            error={errors.pln_delay_days?.message}
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="2"
                                className={fieldClass}
                                {...register("pln_delay_days")}
                            />
                        </FieldError>

                        <FieldError
                            label="Rata-rata Tagihan PDAM"
                            error={errors.pdam_bill_avg?.message}
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="150000"
                                className={fieldClass}
                                {...register("pdam_bill_avg")}
                            />
                        </FieldError>

                        <FieldError
                            label="Keterlambatan PDAM (kali)"
                            error={errors.pdam_late_payments?.message}
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                className={fieldClass}
                                {...register("pdam_late_payments")}
                            />
                        </FieldError>
                    </div>

                    <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-accent px-8 py-3 text-sm sm:ml-auto sm:w-fit sm:text-base font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting && (
                                <Loader2 size={18} className="animate-spin" />
                            )}
                            Generate Risk Profile
                        </button>
                    </div>
                </form>
            </div>
        </main>
    )
}

function FieldError({
    label,
    error,
    children,
}: {
    label: string
    error?: string
    children: ReactNode
}) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                {label}
            </label>

            {children}

            {error && (
                <p className="flex items-center gap-1 text-xs text-red-600">
                    <CircleAlert size={14} />
                    {error}
                </p>
            )}
        </div>
    )
}
