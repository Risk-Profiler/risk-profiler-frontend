"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
    Check,
    CheckCircle2,
    ChevronRight,
    Eye,
    FilePlus2,
    ListFilter,
    MoreHorizontal,
    Search,
    Trash2,
    WalletCards,
    X,
    XCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { requestDecisionUpdate } from "@/lib/api"
import {
    getDecisionDisplay,
    getDecisionState,
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

type SortOption =
    | "submit-newest"
    | "submit-oldest"
    | "age-oldest"
    | "age-youngest"

const sortOptions: Array<{
    value: SortOption
    label: string
}> = [
    {
        value: "submit-newest",
        label: "Submit terbaru",
    },
    {
        value: "submit-oldest",
        label: "Submit terlama",
    },
    {
        value: "age-oldest",
        label: "Usia tertua",
    },
    {
        value: "age-youngest",
        label: "Usia termuda",
    },
]

const MAX_LIMIT_FILTER = 50000000

function formatCurrency(value: number) {
    return `Rp ${value.toLocaleString("id-ID")}`
}

function parseCurrencyInput(value: string) {
    const digits = value.replace(/\D/g, "")

    if (!digits) {
        return null
    }

    return Number(digits)
}

function formatCurrencyInput(value: string) {
    const parsed = parseCurrencyInput(value)

    if (parsed === null) {
        return ""
    }

    return formatCurrency(Math.min(parsed, MAX_LIMIT_FILTER))
}

function getLimitBounds(profiles: RiskProfile[]) {
    if (profiles.length === 0) {
        return {
            min: 0,
            max: 100000000,
        }
    }

    const limits = profiles.map((profile) => profile.limit)
    const min = Math.min(...limits)
    const max = Math.max(...limits)

    return {
        min: Math.max(0, Math.floor(min / 1000000) * 1000000),
        max: Math.min(
            MAX_LIMIT_FILTER,
            Math.max(1000000, Math.ceil(max / 1000000) * 1000000)
        ),
    }
}

function formatArchiveDate(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return {
            year: "----",
            date: "-",
        }
    }

    return {
        year: String(date.getFullYear()),
        date: new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
        }).format(date),
    }
}

function formatAge(months: number) {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years === 0) return `${remainingMonths} bln`
    if (remainingMonths === 0) return `${years} thn`
    return `${years} thn ${remainingMonths} bln`
}

function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof HTMLElement
        ? Boolean(target.closest("button, a, input, select, textarea"))
        : false
}

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
        saveSelectedProfile(umkm)
        toast.info("Membuka detail analisis", {
            description: `${umkm.name} siap direview.`,
        })
        router.push("/details")
    }

    const handleRevise = (umkm: RiskProfile) => {
        saveSelectedProfile(umkm)
        toast.info("Membuka revisi plafon", {
            description: `${umkm.name} siap direvisi.`,
        })
        router.push("/details?revision=1")
    }

    const handleDelete = (umkm: RiskProfile) => {
        persistData(removeProfile(umkm.id))
        toast.success("Pengajuan dihapus", {
            description: `${umkm.name} sudah dikeluarkan dari daftar.`,
        })
    }

    const updateStatus = async (
        profile: RiskProfile,
        status: "Approved" | "Rejected" | "Revision Requested",
        note: string
    ) => {
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
                                    className="group grid cursor-pointer gap-4 px-4 py-4 transition hover:bg-light-green-accent/35 focus-visible:bg-light-green-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-accent/20 sm:px-5 md:grid-cols-[1fr_auto] md:items-start lg:grid-cols-[76px_minmax(260px,1.7fr)_minmax(180px,.85fr)_minmax(190px,1fr)_44px] lg:items-center"
                                >
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

function SelectedFilterChip({
    label,
    onClear,
}: {
    label: string
    onClear: () => void
}) {
    return (
        <span className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full bg-light-green-accent px-3 py-1 text-xs font-semibold text-green-accent">
            <span className="truncate">
                {label}
            </span>
            <button
                type="button"
                aria-label={`Hapus filter ${label}`}
                onClick={onClear}
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full transition hover:bg-green-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-green-accent/20"
            >
                <X size={13} />
            </button>
        </span>
    )
}

function FilterDropdown({
    activeCount,
    sortBy,
    onSortChange,
    limitMin,
    limitMax,
    onLimitMinChange,
    onLimitMaxChange,
    limitBounds,
    categoryOptions,
    selectedCategories,
    onSelectedCategoriesChange,
    onReset,
}: {
    activeCount: number
    sortBy: SortOption
    onSortChange: (value: SortOption) => void
    limitMin: string
    limitMax: string
    onLimitMinChange: (value: string) => void
    onLimitMaxChange: (value: string) => void
    limitBounds: { min: number; max: number }
    categoryOptions: string[]
    selectedCategories: string[]
    onSelectedCategoriesChange: (value: string[]) => void
    onReset: () => void
}) {
    const selectedSet = new Set(selectedCategories)
    const parsedMin = parseCurrencyInput(limitMin)
    const parsedMax = parseCurrencyInput(limitMax)
    const sliderMin = parsedMin ?? limitBounds.min
    const sliderMax = parsedMax ?? limitBounds.max
    const sliderValue: [number, number] =
        sliderMin <= sliderMax
            ? [sliderMin, sliderMax]
            : [sliderMax, sliderMin]
    const sliderStep = 500000

    const toggleCategory = (category: string) => {
        if (selectedSet.has(category)) {
            onSelectedCategoriesChange(
                selectedCategories.filter((item) => item !== category)
            )
            return
        }

        onSelectedCategoriesChange([...selectedCategories, category])
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-between rounded-xl border-green-accent/25 px-3.5 text-green-accent hover:bg-light-green-accent sm:w-fit"
                >
                    <span className="inline-flex items-center gap-2">
                        <ListFilter size={16} />
                        Filter
                    </span>
                    {activeCount > 0 && (
                        <span className="ml-3 rounded-full bg-green-accent px-2 py-0.5 text-xs font-bold text-white">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-[min(26rem,calc(100vw-2rem))] border-green-accent/20 p-4"
            >
                <div className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold">
                                Filter UMKM
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Atur urutan, plafon, dan tipe bisnis.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            disabled={activeCount === 0}
                            className="text-green-accent hover:bg-light-green-accent hover:text-green-accent"
                        >
                            Reset
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Urutkan
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {sortOptions.map((option) => {
                                const isSelected = option.value === sortBy

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => onSortChange(option.value)}
                                        className={`flex h-10 items-center justify-between rounded-lg border px-3 text-sm font-semibold transition hover:border-green-accent hover:bg-light-green-accent hover:text-green-accent focus:outline-none focus:ring-2 focus:ring-green-accent/20 ${
                                            isSelected
                                                ? "border-green-accent bg-light-green-accent text-green-accent"
                                                : "border-border"
                                        }`}
                                    >
                                        {option.label}
                                        {isSelected && <Check size={15} />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Range nominal plafon
                        </p>
                        <div className="rounded-xl border border-green-accent/15 bg-light-green-accent/30 px-3 py-4">
                            <Slider
                                min={limitBounds.min}
                                max={limitBounds.max}
                                step={sliderStep}
                                value={sliderValue}
                                onValueChange={(value) => {
                                    const [minValue, maxValue] = value

                                    onLimitMinChange(formatCurrency(minValue))
                                    onLimitMaxChange(formatCurrency(maxValue))
                                }}
                            />
                            <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-green-accent">
                                <span>{formatCurrency(limitBounds.min)}</span>
                                <span>{formatCurrency(limitBounds.max)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                value={limitMin}
                                onChange={(event) =>
                                    onLimitMinChange(
                                        formatCurrencyInput(event.target.value)
                                    )
                                }
                                inputMode="numeric"
                                placeholder="Min plafon"
                                className="rounded-xl"
                            />
                            <Input
                                value={limitMax}
                                onChange={(event) =>
                                    onLimitMaxChange(
                                        formatCurrencyInput(event.target.value)
                                    )
                                }
                                inputMode="numeric"
                                placeholder="Max plafon"
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Tipe bisnis
                        </p>
                        {categoryOptions.length === 0 ? (
                            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                                Belum ada tipe bisnis.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {categoryOptions.map((category) => {
                                    const isSelected = selectedSet.has(category)

                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => toggleCategory(category)}
                                            className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition hover:border-green-accent hover:bg-light-green-accent hover:text-green-accent focus:outline-none focus:ring-2 focus:ring-green-accent/20 ${
                                                isSelected
                                                    ? "border-green-accent bg-light-green-accent text-green-accent"
                                                    : "border-border text-muted-foreground"
                                            }`}
                                        >
                                            {isSelected && <Check size={14} />}
                                            {category.toUpperCase()}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

function ArchiveActionMenu({
    profile,
    onReview,
    onApprove,
    onDecline,
    onRevise,
    onDelete,
}: {
    profile: RiskProfile
    onReview: () => void
    onApprove: () => void
    onDecline: () => void
    onRevise: () => void
    onDelete: () => void
}) {
    const decisionState = getDecisionState(profile.status)
    const hasDecision = decisionState !== "pending"

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Buka aksi untuk ${profile.name}`}
                    className="text-muted-foreground hover:bg-light-green-accent hover:text-green-accent aria-expanded:bg-light-green-accent aria-expanded:text-green-accent"
                >
                    <MoreHorizontal size={18} />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-52 p-2"
            >
                <div className="grid gap-1">
                    <MenuAction
                        icon={<Eye size={16} />}
                        label="Lihat detail"
                        onClick={onReview}
                    />

                    <div className="my-1 border-t" />

                    <p className="px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
                        {hasDecision ? "Ubah keputusan" : "Keputusan"}
                    </p>

                    <MenuAction
                        icon={<CheckCircle2 size={16} />}
                        label="Terima"
                        meta={decisionState === "approved" ? "Saat ini" : undefined}
                        onClick={onApprove}
                        disabled={decisionState === "approved"}
                        className="text-green-accent hover:bg-light-green-accent hover:text-green-accent"
                    />

                    <MenuAction
                        icon={<XCircle size={16} />}
                        label="Tolak"
                        meta={decisionState === "rejected" ? "Saat ini" : undefined}
                        onClick={onDecline}
                        disabled={decisionState === "rejected"}
                        className="text-red-accent hover:bg-light-red-accent hover:text-red-accent"
                    />

                    <MenuAction
                        icon={<ChevronRight size={16} />}
                        label="Revisi"
                        meta={decisionState === "revision" ? "Saat ini" : undefined}
                        onClick={onRevise}
                        disabled={decisionState === "revision"}
                        className="text-yellowish-accent hover:bg-light-yellowish-accent hover:text-yellowish-accent"
                    />

                    <div className="my-1 border-t" />
                    <MenuAction
                        icon={<Trash2 size={16} />}
                        label="Delete"
                        onClick={onDelete}
                        className="text-red-accent hover:bg-light-red-accent hover:text-red-accent"
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}

function MenuAction({
    icon,
    label,
    meta,
    onClick,
    className = "",
    disabled = false,
}: {
    icon: ReactNode
    label: string
    meta?: string
    onClick: () => void
    className?: string
    disabled?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold transition hover:bg-muted focus:bg-muted focus:outline-none disabled:cursor-default disabled:opacity-60 disabled:hover:bg-transparent ${className}`}
        >
            {icon}
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span>{label}</span>
                {meta && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                        {meta}
                    </span>
                )}
            </span>
        </button>
    )
}

function DashboardSkeleton() {
    return (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-background">
            <div className="hidden grid-cols-[76px_minmax(260px,1.7fr)_minmax(180px,.85fr)_minmax(190px,1fr)_44px] items-center gap-4 border-b bg-muted/25 px-5 py-3 lg:grid">
                {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} className="h-3 w-16" />
                ))}
            </div>

            <div className="divide-y">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[1fr_auto] md:items-start lg:grid-cols-[76px_minmax(260px,1.7fr)_minmax(180px,.85fr)_minmax(190px,1fr)_44px] lg:items-center"
                    >
                        <div className="space-y-2 md:col-span-2 lg:col-span-1">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-3 w-10" />
                        </div>
                        <div className="space-y-2 md:col-start-1 lg:col-start-auto">
                            <Skeleton className="h-5 w-44 max-w-full" />
                            <Skeleton className="h-3 w-64 max-w-full" />
                        </div>
                        <div className="flex flex-wrap gap-2 md:col-start-1 lg:col-start-auto">
                            <Skeleton className="h-7 w-28 rounded-full" />
                            <Skeleton className="h-7 w-24 rounded-full" />
                        </div>
                        <div className="space-y-2 md:col-start-1 lg:col-start-auto">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex gap-2 md:col-start-2 md:row-start-2 md:justify-end lg:col-start-auto lg:row-start-auto">
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
