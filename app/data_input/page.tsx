"use client"

import {
    ArrowRight,
    Building2,
    Loader2,
    ReceiptText,
    WalletCards,
    Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"

import BusinessAgePicker from "@/components/data-input/business-age-picker"
import CategorySelect from "@/components/data-input/category-select"
import FieldError from "@/components/data-input/field-error"
import FormSection from "@/components/data-input/form-section"
import InfoModal from "@/components/data-input/info-modal"
import InputWithUnit from "@/components/data-input/input-with-unit"
import { Input } from "@/components/ui/input"
import { requestRiskPrediction } from "@/lib/api"
import {
    createMerchantId,
    fieldInfo,
    formatBoundedIntegerInput,
    formatDateInput,
    formatIntegerInput,
    formatRatingInput,
    formatRupiahInput,
    formatTextInput,
    formSchema,
    normalizeCategory,
    type FieldInfo,
    type FormInput,
    type FormOutput,
    type FormValidation,
} from "@/lib/data-input"
import {
    createRiskProfile,
} from "@/lib/risk-profile"
import {
    savePredictionResult,
    saveSelectedProfile,
    upsertProfile,
} from "@/lib/risk-storage"

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
        FormInput,
        unknown,
        FormOutput
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
