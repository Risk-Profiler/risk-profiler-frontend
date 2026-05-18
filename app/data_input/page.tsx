"use client"

import { CircleAlert } from "lucide-react"

import { useRouter } from "next/navigation"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const requiredNumber = (field: string) =>
    z
        .string()
        .min(1, `${field} wajib diisi`)
        .refine((val) => !isNaN(Number(val)), {
            message: `${field} harus berupa angka`,
        })
        .transform((val) => Number(val))

const formSchema = z.object({
    name: z.string().min(1, "Nama UMKM tidak boleh kosong."),
    business_category: z
        .string()
        .min(1, "Business Category tidak boleh kosong."),
    business_age_months: requiredNumber("Business Age"),
    qris_volume_monthly: requiredNumber("QRIS Volume Monthly"),
    qris_active_days: requiredNumber("QRIS Active Days"),
    ecommerce_rating: requiredNumber("E-commerce Rating"),
    pln_delay_days: requiredNumber("PLN Delay Days"),
})

type FormValidation = z.infer<typeof formSchema>

type PredictionResponse = {
    score: number
    risk_level: string
    recommended_limit: number
    probability: number
    band: string
}

export default function InputPage() {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
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
        },
    })

    const onSubmit = async (data: FormValidation) => {
        const payload = {
            merchant_id: 1,
            ...data,
        }

        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        })

        const result: PredictionResponse = await response.json()

        localStorage.setItem(
            "prediction_result",
            JSON.stringify(result)
        )

        const newDebitur = {
            id: `LA-2026-${Math.floor(Math.random() * 9000) + 1000}`,
            name: data.name,
            owner: "New Applicant",
            category: data.business_category,
            score: result.score,
            risk: result.risk_level,
            limit: result.recommended_limit,
            status: "Pending",
        }

        const existingDebitur = JSON.parse(
            localStorage.getItem("debitur_list") || "[]"
        )

        localStorage.setItem(
            "debitur_list",
            JSON.stringify([newDebitur, ...existingDebitur])
        )

        router.push("/dashboard")
    }

    return (
        <div className="min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
                <form
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full max-w-5xl space-y-6 rounded-3xl border bg-background p-6 sm:p-8"
                >
                    {/* header */}
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Credit Scoring Form
                        </p>

                        <h1 className="break-words text-3xl sm:text-4xl font-bold">
                            Input UMKM Data
                        </h1>

                        <p className="text-sm sm:text-base text-muted-foreground">
                            Masukkan data UMKM untuk melakukan analisis risiko
                            kredit secara otomatis.
                        </p>
                    </div>

                    <hr />

                    {/* nama */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Nama UMKM
                        </label>

                        <input
                            type="text"
                            placeholder="Nama UMKM-mu"
                            className="w-full rounded-xl border bg-background px-4 py-3 text-sm sm:text-base outline-none transition focus:border-green-accent"
                            {...register("name")}
                        />

                        {errors.name && (
                            <p className="flex items-center gap-1 text-xs text-red-600">
                                <CircleAlert size={14} />
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* grid form */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Business Category
                            </label>

                            <input
                                type="text"
                                placeholder="fnb / retail / fashion"
                                className="w-full rounded-xl border bg-background px-4 py-3 text-sm sm:text-base outline-none transition focus:border-green-accent"
                                {...register("business_category")}
                            />

                            {errors.business_category && (
                                <p className="flex items-center gap-1 text-xs text-red-600">
                                    <CircleAlert size={14} />
                                    {errors.business_category.message}
                                </p>
                            )}
                        </div>

                        {/* age */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Business Age (Months)
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="24"
                                className="w-full rounded-xl border bg-background px-4 py-3 text-sm sm:text-base outline-none transition focus:border-green-accent"
                                {...register("business_age_months")}
                            />

                            {errors.business_age_months && (
                                <p className="flex items-center gap-1 text-xs text-red-600">
                                    <CircleAlert size={14} />
                                    {
                                        errors.business_age_months
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* qris volume */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                QRIS Volume Monthly
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="5000000"
                                className="w-full rounded-xl border bg-background px-4 py-3 text-sm sm:text-base outline-none transition focus:border-green-accent"
                                {...register("qris_volume_monthly")}
                            />

                            {errors.qris_volume_monthly && (
                                <p className="flex items-center gap-1 text-xs text-red-600">
                                    <CircleAlert size={14} />
                                    {
                                        errors.qris_volume_monthly
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* qris active days */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                QRIS Active Days
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="22"
                                className="w-full rounded-xl border bg-background px-4 py-3 text-sm sm:text-base outline-none transition focus:border-green-accent"
                                {...register("qris_active_days")}
                            />

                            {errors.qris_active_days && (
                                <p className="flex items-center gap-1 text-xs text-red-600">
                                    <CircleAlert size={14} />
                                    {
                                        errors.qris_active_days
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* ecommerce */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                E-commerce Rating
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="4.8"
                                className="w-full rounded-xl border bg-background px-4 py-3 text-sm sm:text-base outline-none transition focus:border-green-accent"
                                {...register("ecommerce_rating")}
                            />

                            {errors.ecommerce_rating && (
                                <p className="flex items-center gap-1 text-xs text-red-600">
                                    <CircleAlert size={14} />
                                    {
                                        errors.ecommerce_rating
                                            .message
                                    }
                                </p>
                            )}
                        </div>

                        {/* pln */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                PLN Delay Days
                            </label>

                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="2"
                                className="w-full rounded-xl border bg-background px-4 py-3 text-sm sm:text-base outline-none transition focus:border-green-accent"
                                {...register("pln_delay_days")}
                            />

                            {errors.pln_delay_days && (
                                <p className="flex items-center gap-1 text-xs text-red-600">
                                    <CircleAlert size={14} />
                                    {
                                        errors.pln_delay_days
                                            .message
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    {/* submit */}
                    <div className="flex flex-col sm:flex-row sm:justify-end">
                        <button
                            type="submit"
                            className="w-full sm:w-fit rounded-xl bg-green-accent px-8 py-3 text-sm sm:text-base font-medium text-white transition hover:opacity-90 cursor-pointer"
                        >
                            Add UMKM
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}