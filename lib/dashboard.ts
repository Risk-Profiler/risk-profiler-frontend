import type { RiskProfile } from "./risk-profile"
import type { RiskStatusFilter } from "./risk-storage"

export const statusOrder: RiskStatusFilter[] = [
    "all",
    "pending",
    "approved",
    "rejected",
    "revision",
]

export type SortOption =
    | "submit-newest"
    | "submit-oldest"
    | "age-oldest"
    | "age-youngest"

export type DashboardPendingAction =
    | "review"
    | "revise"
    | "approve"
    | "reject"
    | "delete"

export const sortOptions: Array<{
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

export const MAX_LIMIT_FILTER = 50000000

export function formatCurrency(value: number) {
    return `Rp ${value.toLocaleString("id-ID")}`
}

export function parseCurrencyInput(value: string) {
    const digits = value.replace(/\D/g, "")

    if (!digits) {
        return null
    }

    return Number(digits)
}

export function formatCurrencyInput(value: string) {
    const parsed = parseCurrencyInput(value)

    if (parsed === null) {
        return ""
    }

    return formatCurrency(Math.min(parsed, MAX_LIMIT_FILTER))
}

export function getLimitBounds(profiles: RiskProfile[]) {
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

export function formatArchiveDate(value: string) {
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

export function formatAge(months: number) {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12

    if (years === 0) return `${remainingMonths} bln`
    if (remainingMonths === 0) return `${years} thn`
    return `${years} thn ${remainingMonths} bln`
}

export function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof HTMLElement
        ? Boolean(target.closest("button, a, input, select, textarea"))
        : false
}
