"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
    FilePlus2,
    Loader2,
    Search,
    WalletCards,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import ArchiveActionMenu from "@/components/dashboard/archive-action-menu"
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton"
import FilterDropdown, {
    SelectedFilterChip,
} from "@/components/dashboard/filter-dropdown"
import { Input } from "@/components/ui/input"
import { requestDecisionUpdate } from "@/lib/api"
import {
    formatAge,
    formatArchiveDate,
    formatCurrency,
    getLimitBounds,
    isInteractiveTarget,
    parseCurrencyInput,
    sortOptions,
    statusOrder,
    type DashboardPendingAction,
    type SortOption,
} from "@/lib/dashboard"
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

export default function Dashboard() {
    const router = useRouter()
    const [umkmData, setUmkmData] = useState<RiskProfile[]>([])
    const [filter, setFilter] = useState<RiskStatusFilter>("all")
    const [query, setQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortOption>("submit-newest")
    const [limitMin, setLimitMin] = useState("")
    const [limitMax, setLimitMax] = useState("")
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [pendingAction, setPendingAction] = useState<{
        id: string
        type: DashboardPendingAction
    } | null>(null)

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

    const categoryOptions = useMemo(() => {
        return Array.from(
            new Set(
                umkmData
                    .map((profile) => profile.category.trim())
                    .filter(Boolean)
            )
        ).sort((a, b) => a.localeCompare(b))
    }, [umkmData])
    const limitBounds = useMemo(() => getLimitBounds(umkmData), [umkmData])

    const visibleData = useMemo(() => {
        const normalizedQuery = query.toLowerCase().trim()
        const normalizedCategories = selectedCategories.map((category) =>
            category.toLowerCase()
        )
        const minLimit = parseCurrencyInput(limitMin)
        const maxLimit = parseCurrencyInput(limitMax)

        const filtered = filterProfiles(umkmData, filter).filter((profile) => {
            const matchesQuery =
                !normalizedQuery ||
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

            const matchesCategory =
                normalizedCategories.length === 0 ||
                normalizedCategories.includes(profile.category.toLowerCase())
            const matchesMin = minLimit === null || profile.limit >= minLimit
            const matchesMax = maxLimit === null || profile.limit <= maxLimit

            return (
                matchesQuery &&
                matchesCategory &&
                matchesMin &&
                matchesMax
            )
        })

        return [...filtered].sort((a, b) => {
            if (sortBy === "submit-oldest") {
                return (
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
            }

            if (sortBy === "age-oldest") {
                return b.input.business_age_months - a.input.business_age_months
            }

            if (sortBy === "age-youngest") {
                return a.input.business_age_months - b.input.business_age_months
            }

            return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
        })
    }, [
        filter,
        limitMax,
        limitMin,
        query,
        selectedCategories,
        sortBy,
        umkmData,
    ])

    const hasSearchFilters =
        query.trim().length > 0 ||
        selectedCategories.length > 0 ||
        limitMin.trim().length > 0 ||
        limitMax.trim().length > 0
    const hasActiveFilters = hasSearchFilters || filter !== "all"
    const activeDropdownFilterCount =
        (sortBy !== "submit-newest" ? 1 : 0) +
        (limitMin.trim().length > 0 || limitMax.trim().length > 0 ? 1 : 0) +
        (selectedCategories.length > 0 ? 1 : 0)
    const selectedSortLabel = sortOptions.find(
        (option) => option.value === sortBy
    )?.label

    const persistData = (data: RiskProfile[]) => {
        setUmkmData(data)
        saveProfiles(data)
    }

    const handleFilterChange = (status: RiskStatusFilter) => {
        setFilter(status)
    }

    const handleReview = (umkm: RiskProfile) => {
        if (pendingAction) return

        setPendingAction({ id: umkm.id, type: "review" })
        saveSelectedProfile(umkm)
        toast.info("Membuka detail analisis", {
            description: `${umkm.name} siap direview.`,
        })
        router.push("/details")
    }

    const handleRevise = (umkm: RiskProfile) => {
        if (pendingAction) return

        setPendingAction({ id: umkm.id, type: "revise" })
        saveSelectedProfile(umkm)
        toast.info("Membuka revisi plafon", {
            description: `${umkm.name} siap direvisi.`,
        })
        router.push("/details?revision=1")
    }

    const handleDelete = (umkm: RiskProfile) => {
        if (pendingAction) return

        setPendingAction({ id: umkm.id, type: "delete" })
        persistData(removeProfile(umkm.id))
        setPendingAction(null)
        toast.success("Pengajuan dihapus", {
            description: `${umkm.name} sudah dikeluarkan dari daftar.`,
        })
    }

    const updateStatus = async (
        profile: RiskProfile,
        status: "Approved" | "Rejected" | "Revision Requested",
        note: string
    ) => {
        if (pendingAction) return

        const actionType =
            status === "Approved"
                ? "approve"
                : status === "Rejected"
                  ? "reject"
                  : "revise"

        setPendingAction({ id: profile.id, type: actionType })

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
        } finally {
            setPendingAction((current) =>
                current?.id === profile.id ? null : current
            )
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

            <section className="mt-6 space-y-4 rounded-2xl border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-lg font-bold">
                            {statusFilters[filter].label}
                        </h2>
                    </div>

                    <div className="relative w-full lg:max-w-sm">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cari nama, ID, kategori..."
                            className="rounded-xl py-3 pl-10 pr-4"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        {visibleData.length} UMKM ditampilkan
                    </p>

                    <FilterDropdown
                        activeCount={activeDropdownFilterCount}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        limitMin={limitMin}
                        limitMax={limitMax}
                        onLimitMinChange={setLimitMin}
                        onLimitMaxChange={setLimitMax}
                        limitBounds={limitBounds}
                        categoryOptions={categoryOptions}
                        selectedCategories={selectedCategories}
                        onSelectedCategoriesChange={setSelectedCategories}
                        onReset={() => {
                            setSortBy("submit-newest")
                            setLimitMin("")
                            setLimitMax("")
                            setSelectedCategories([])
                        }}
                    />
                </div>

                {(activeDropdownFilterCount > 0 || query.trim()) && (
                    <div className="flex flex-wrap gap-2 border-t pt-4">
                        {query.trim() && (
                            <SelectedFilterChip
                                label={`Search: ${query.trim()}`}
                                onClear={() => setQuery("")}
                            />
                        )}

                        {sortBy !== "submit-newest" && selectedSortLabel && (
                            <SelectedFilterChip
                                label={`Urutan: ${selectedSortLabel}`}
                                onClear={() => setSortBy("submit-newest")}
                            />
                        )}

                        {(limitMin.trim() || limitMax.trim()) && (
                            <SelectedFilterChip
                                label={`Plafon: ${limitMin || "Min"} - ${limitMax || "Max"}`}
                                onClear={() => {
                                    setLimitMin("")
                                    setLimitMax("")
                                }}
                            />
                        )}

                        {selectedCategories.map((category) => (
                            <SelectedFilterChip
                                key={category}
                                label={`Tipe: ${category.toUpperCase()}`}
                                onClear={() =>
                                    setSelectedCategories(
                                        selectedCategories.filter(
                                            (item) => item !== category
                                        )
                                    )
                                }
                            />
                        ))}
                    </div>
                )}
            </section>

            {loading && <DashboardSkeleton />}

            {!loading && visibleData.length === 0 && (
                <div className="mt-6 rounded-2xl border border-dashed p-8 sm:p-12 lg:p-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-light-green-accent text-green-accent">
                        <WalletCards size={24} />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold">
                        {hasActiveFilters ? "Tidak ada hasil yang cocok" : "Belum ada pengajuan"}
                    </h1>

                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                        {hasActiveFilters
                            ? "Coba kata kunci lain atau hapus filter pencarian."
                            : "Mulai dari input data UMKM."}
                    </p>

                    {!hasActiveFilters && (
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
                <div className="mt-6 overflow-hidden rounded-2xl border bg-background">
                    <div className="hidden grid-cols-[76px_minmax(260px,1.7fr)_minmax(180px,.85fr)_minmax(190px,1fr)_44px] items-center gap-4 border-b bg-muted/25 px-5 py-3 text-xs font-semibold uppercase text-muted-foreground lg:grid">
                        <span>Tanggal</span>
                        <span>UMKM</span>
                        <span>Indikator</span>
                        <span>Plafon</span>
                        <span></span>
                    </div>

                    <div className="divide-y">
                        {visibleData.map((umkm, index) => {
                            const archiveDate = formatArchiveDate(umkm.createdAt)
                            const compactStatus =
                                statusFilters[getProfileFilter(umkm)].label
                            const rowPendingAction =
                                pendingAction?.id === umkm.id
                                    ? pendingAction.type
                                    : null
                            const isOpening =
                                rowPendingAction === "review" ||
                                rowPendingAction === "revise"
                            const isSavingDecision =
                                rowPendingAction === "approve" ||
                                rowPendingAction === "reject"
                            const isRowBusy = isOpening || isSavingDecision

                            return (
                                <motion.article
                                    key={umkm.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleReview(umkm)}
                                    onKeyDown={(event) => {
                                        if (isInteractiveTarget(event.target)) return

                                        if (
                                            event.key === "Enter" ||
                                            event.key === " "
                                        ) {
                                            event.preventDefault()
                                            handleReview(umkm)
                                        }
                                    }}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.22,
                                        delay: index * 0.025,
                                    }}
                                    className={`group relative grid cursor-pointer gap-4 px-4 py-4 transition hover:bg-light-green-accent/35 focus-visible:bg-light-green-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-accent/20 sm:px-5 md:grid-cols-[1fr_auto] md:items-start lg:grid-cols-[76px_minmax(260px,1.7fr)_minmax(180px,.85fr)_minmax(190px,1fr)_44px] lg:items-center ${
                                        isRowBusy ? "pointer-events-none opacity-70" : ""
                                    }`}
                                >
                                    {isRowBusy && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/55 backdrop-blur-[1px]">
                                            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-xs font-semibold text-green-accent shadow-sm">
                                                <Loader2 size={15} className="animate-spin" />
                                                {isOpening ? "Membuka detail" : "Menyimpan keputusan"}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-3 md:col-span-2 lg:col-span-1 lg:block">
                                        <p className="text-sm font-semibold text-green-accent lg:text-base">
                                            {archiveDate.year}
                                        </p>
                                        <p className="text-xs font-medium text-muted-foreground lg:mt-1">
                                            {archiveDate.date}
                                        </p>
                                    </div>

                                    <div className="min-w-0 md:col-start-1 lg:col-start-auto">
                                        <p className="block max-w-full truncate text-left text-base font-bold transition group-hover:text-green-accent">
                                            {umkm.name}
                                        </p>
                                        <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                                            {umkm.id} - {umkm.category.toUpperCase()} - Usia {formatAge(umkm.input.business_age_months)}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 md:col-start-1 lg:col-start-auto">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(umkm.status)}`}>
                                            {compactStatus}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${getRiskColor(umkm.risk)}`}>
                                            Skor {umkm.score}/100
                                        </span>
                                    </div>

                                    <div className="min-w-0 md:col-start-1 lg:col-start-auto">
                                        <p className="truncate text-sm font-bold">
                                            {formatCurrency(umkm.limit)}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-muted-foreground">
                                            QRIS {formatCurrency(umkm.input.qris_volume_monthly)}
                                        </p>
                                    </div>

                                    <div
                                        className="flex justify-start md:col-start-2 md:row-start-2 md:justify-end lg:col-start-auto lg:row-start-auto"
                                        onClick={(event) => event.stopPropagation()}
                                        onKeyDown={(event) => event.stopPropagation()}
                                    >
                                        <ArchiveActionMenu
                                            profile={umkm}
                                            pendingAction={rowPendingAction}
                                            disabled={Boolean(pendingAction)}
                                            onReview={() => handleReview(umkm)}
                                            onApprove={() =>
                                                updateStatus(
                                                    umkm,
                                                    "Approved",
                                                    "Pengajuan diterima berdasarkan hasil review analis."
                                                )
                                            }
                                            onDecline={() =>
                                                updateStatus(
                                                    umkm,
                                                    "Rejected",
                                                    "Pengajuan ditolak berdasarkan hasil review analis."
                                                )
                                            }
                                            onRevise={() =>
                                                handleRevise(umkm)
                                            }
                                            onDelete={() => handleDelete(umkm)}
                                        />
                                    </div>
                                </motion.article>
                            )
                        })}
                    </div>
                </div>
            )}
        </main>
    )
}
