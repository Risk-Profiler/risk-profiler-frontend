import { hydrateRiskProfile, type RiskProfile } from "./risk-profile"

const DEBITUR_LIST_KEY = "debitur_list"
const SELECTED_DEBITUR_KEY = "selected_debitur"
const PREDICTION_RESULT_KEY = "prediction_result"

export type RiskStatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "revision"

export const statusFilters: Record<
  RiskStatusFilter,
  {
    label: string
    description: string
  }
> = {
  all: {
    label: "Semua UMKM",
    description: "Seluruh pengajuan yang pernah masuk.",
  },
  pending: {
    label: "Diajukan",
    description: "Pengajuan yang menunggu keputusan analis.",
  },
  approved: {
    label: "Diterima",
    description: "Pengajuan yang sudah direkomendasikan approval.",
  },
  rejected: {
    label: "Ditolak",
    description: "Pengajuan yang sudah direkomendasikan penolakan.",
  },
  revision: {
    label: "Ajukan Revisi",
    description: "Pengajuan yang membutuhkan perubahan plafon.",
  },
}

export function getProfileFilter(profile: RiskProfile): RiskStatusFilter {
  const normalized = profile.status.toLowerCase()

  if (normalized.includes("approved")) return "approved"
  if (normalized.includes("rejected")) return "rejected"
  if (normalized.includes("revision")) return "revision"
  return "pending"
}

export function filterProfiles(
  profiles: RiskProfile[],
  filter: RiskStatusFilter
) {
  if (filter === "all") return profiles
  return profiles.filter((profile) => getProfileFilter(profile) === filter)
}

export function readProfiles() {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(DEBITUR_LIST_KEY)
  if (!stored) return []

  try {
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    return parsed.map((item) =>
      hydrateRiskProfile(item as Partial<RiskProfile>)
    )
  } catch (error) {
    console.error("Failed to read debitur list:", error)
    return []
  }
}

export function saveProfiles(profiles: RiskProfile[]) {
  localStorage.setItem(DEBITUR_LIST_KEY, JSON.stringify(profiles))
}

export function upsertProfile(profile: RiskProfile) {
  const profiles = readProfiles()
  const exists = profiles.some((item) => item.id === profile.id)
  const nextProfiles = exists
    ? profiles.map((item) => (item.id === profile.id ? profile : item))
    : [profile, ...profiles]

  saveProfiles(nextProfiles)
  return nextProfiles
}

export function removeProfile(id: string) {
  const nextProfiles = readProfiles().filter((profile) => profile.id !== id)
  saveProfiles(nextProfiles)
  return nextProfiles
}

export function saveSelectedProfile(profile: RiskProfile) {
  localStorage.setItem(SELECTED_DEBITUR_KEY, JSON.stringify(profile))
}

export function readSelectedProfile() {
  const stored =
    localStorage.getItem(SELECTED_DEBITUR_KEY) ??
    localStorage.getItem(PREDICTION_RESULT_KEY)

  if (!stored) return null

  try {
    const parsed: unknown = JSON.parse(stored)
    return hydrateRiskProfile(parsed as Partial<RiskProfile>)
  } catch (error) {
    console.error("Failed to read selected debitur:", error)
    return null
  }
}

export function savePredictionResult(profile: RiskProfile) {
  localStorage.setItem(PREDICTION_RESULT_KEY, JSON.stringify(profile))
}
