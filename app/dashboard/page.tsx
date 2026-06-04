"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { FilePlus2, Search, WalletCards } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import DecisionActions from "@/components/debitur/decision-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { requestDecisionUpdate } from "@/lib/api"
import {
    getDecisionDisplay,
    getRiskColor,
    getStatusStyle,
    type RiskProfile,
} from "@/lib/risk-profile"
import {
    filterProfiles,
    getProfileFilter,
    readProfiles,
    removeProfile,
    saveProfiles,
    saveSelectedProfile,
    statusFilters,
    type RiskStatusFilter,
} from "@/lib/risk-storage"

const statusOrder: RiskStatusFilter[] = [
    "all",
    "pending",
    "approved",
    "rejected",
    "revision",
]

export default function Dashboard() {
    const router = useRouter()
    const [umkmData, setUmkmData] = useState<RiskProfile[]>([])
    const [filter, setFilter] = useState<RiskStatusFilter>("all")
    const [query, setQuery] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const profiles = readProfiles()

        window.setTimeout(() => {
            setUmkmData(profiles)
            setLoading(false)
        }, 0)

        if (profiles.length > 0) {
            saveProfiles(profiles)
        }
    }, [])

    const counts = useMemo(() => {
        return umkmData.reduce(
            (acc, profile) => {
                acc.all += 1
                acc[getProfileFilter(profile)] += 1
                return acc
            },
            {
                all: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                revision: 0,
            } satisfies Record<RiskStatusFilter, number>
        )
    }, [umkmData])

    const visibleData = useMemo(() => {
        const filtered = filterProfiles(umkmData, filter)
        const normalizedQuery = query.toLowerCase().trim()

        if (!normalizedQuery) return filtered

        return filtered.filter((profile) =>
            [
                profile.name,
                profile.id,
                profile.category,
                profile.riskLabel,
                profile.status,
            ]
                .join(" ")
                .toLowerCase()
                .includes(normalizedQuery)
        )
    }, [filter, query, umkmData])

    const persistData = (data: RiskProfile[]) => {
        setUmkmData(data)
        saveProfiles(data)
    }

    const handleFilterChange = (status: RiskStatusFilter) => {
        setFilter(status)
    }

    const handleReview = (umkm: RiskProfile) => {
        saveSelectedProfile(umkm)
        toast.info("Membuka detail analisis", {
            description: `${umkm.name} siap direview.`,
        })
        router.push("/details")
    }

    const handleDelete = (umkm: RiskProfile) => {
        persistData(removeProfile(umkm.id))
        toast.success("Pengajuan dihapus", {
            description: `${umkm.name} sudah dikeluarkan dari daftar.`,
        })
    }

    const updateStatus = async (profile: RiskProfile, status: "Approved" | "Rejected", note: string) => {
        const updatedData = umkmData.map((umkm) =>
            umkm.id === profile.id
                ? {
                      ...umkm,
                      status,
                      decisionNote: note,
                  }
                : umkm
        )

        persistData(updatedData)
        toast.success(`Status ${profile.name} diperbarui`, {
            description: getDecisionDisplay(status).title,
        })

        try {
            await requestDecisionUpdate({
                merchant_id: profile.input.merchant_id,
                status,
                note,
            })
        } catch (error) {
            console.error("Decision sync failed:", error)
            toast.warning("Keputusan tersimpan secara lokal", {
                description:
                    "Sinkronisasi ke backend belum berhasil. Data tetap tersimpan di browser.",
            })
        }
    }

    return (
        <main className="overflow-hidden p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl space-y-2">
                    <h1 className="break-words text-2xl sm:text-3xl lg:text-4xl font-bold">
                        Review Pengajuan Pembiayaan
                    </h1>
                </div>

                <Link
                    href="/data_input"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 sm:w-fit"
                >
                    <FilePlus2 size={18} />
                    Input UMKM
                </Link>
            </div>

            <section className="mt-6 space-y-3 rounded-2xl border p-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {statusOrder.map((status) => (
                    <button
                        key={status}
                        type="button"
                        onClick={() => handleFilterChange(status)}
                        className={`rounded-xl border p-4 text-left transition hover:bg-muted ${
                            filter === status ? "border-green-accent" : ""
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {statusFilters[status].label}
                                </p>
                                <h2 className="mt-2 text-3xl font-bold">
                                    {counts[status]}
                                </h2>
                            </div>
                        </div>
                    </button>
                ))}
                </div>
            </section>

            <section className="mt-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-bold">
                        {statusFilters[filter].label}
                    </h2>
                </div>

                <div className="relative w-full sm:max-w-sm">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari nama, ID, kategori..."
                        className="w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-accent"
                    />
                </div>
            </section>

            {loading && <DashboardSkeleton />}

            {!loading && visibleData.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed p-8 sm:p-12 lg:p-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-light-green-accent text-green-accent">
                        <WalletCards size={24} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold">
                        {query ? "Tidak ada hasil yang cocok" : "Belum ada pengajuan"}
                    </h1>

                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                        {query
                            ? "Coba kata kunci lain atau hapus filter pencarian."
                            : "Mulai dari input data UMKM."}
                    </p>

                    {!query && (
                        <Link
                            href="/data_input"
                            className="mt-5 inline-flex rounded-lg bg-green-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                        >
                            Input UMKM
                        </Link>
                    )}
                </div>
            )}

            {!loading && (
            <div className="mt-6 grid gap-4 sm:gap-6">
                {visibleData.map((umkm, index) => {
                    const statusDisplay = getDecisionDisplay(umkm.status)

                    return (
                    <motion.article
                        key={umkm.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: index * 0.03 }}
                        className="overflow-hidden rounded-2xl border bg-background p-4 sm:p-6 transition hover:shadow-md"
                    >
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="break-words text-xl sm:text-2xl font-bold">
                                        {umkm.name}
                                    </h1>

                                    <p className={`rounded-full px-4 py-1 text-xs sm:text-sm font-medium ${getStatusStyle(umkm.status)}`}>
                                        {statusDisplay.title}
                                    </p>

                                    <p className={`rounded-full px-4 py-1 text-xs sm:text-sm font-medium text-white ${getRiskColor(umkm.risk)}`}>
                                        {umkm.riskLabel}
                                    </p>
                                </div>

                                <p className="break-words text-sm sm:text-base text-muted-foreground">
                                    {umkm.id} - {umkm.category} - Band {umkm.band}
                                </p>
                            </div>

                            <div className="lg:text-right">
                                <p className="text-sm text-muted-foreground">
                                    Recommended Limit
                                </p>

                                <h1 className="break-words text-2xl sm:text-3xl font-bold">
                                    Rp {umkm.limit.toLocaleString("id-ID")}
                                </h1>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">
                                    Risk Score
                                </p>
                                <h1 className="mt-2 text-2xl font-bold">
                                    {umkm.score}/100
                                </h1>
                            </div>

                            <div className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">
                                    Confidence
                                </p>
                                <h1 className="mt-2 text-base font-semibold">
                                    {umkm.confidence}
                                </h1>
                            </div>

                            <div className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">
                                    QRIS Monthly
                                </p>
                                <h1 className="mt-2 text-base font-semibold">
                                    Rp {umkm.input.qris_volume_monthly.toLocaleString("id-ID")}
                                </h1>
                            </div>

                            <div className="rounded-xl border p-4">
                                <p className="text-sm text-muted-foreground">
                                    PLN Delay
                                </p>
                                <h1 className="mt-2 text-base font-semibold">
                                    {umkm.input.pln_delay_days} hari
                                </h1>
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-t pt-4 lg:flex-row lg:items-center lg:justify-end">
                            <button
                                onClick={() => handleDelete(umkm)}
                                className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 lg:w-fit"
                            >
                                Delete
                            </button>

                            <DecisionActions
                                status={umkm.status}
                                onReview={() => handleReview(umkm)}
                                onDecline={() =>
                                    updateStatus(
                                        umkm,
                                        "Rejected",
                                        "Pengajuan ditolak berdasarkan hasil review analis."
                                    )
                                }
                                onApprove={() =>
                                    updateStatus(
                                        umkm,
                                        "Approved",
                                        "Pengajuan diterima berdasarkan hasil review analis."
                                    )
                                }
                            />
                        </div>
                    </motion.article>
                    )
                })}
            </div>
            )}
        </main>
    )
}

function DashboardSkeleton() {
    return (
        <div className="mt-6 grid gap-4 sm:gap-6">
            {[1, 2, 3].map((item) => (
                <div key={item} className="rounded-2xl border p-4 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                            <Skeleton className="h-7 w-52" />
                            <Skeleton className="h-4 w-72 max-w-full" />
                        </div>
                        <div className="space-y-3 lg:text-right">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-8 w-48" />
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((card) => (
                            <Skeleton key={card} className="h-24 rounded-xl" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
