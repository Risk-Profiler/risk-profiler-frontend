import type { RiskProfile } from "./risk-profile"

export type PendingDecision = "approve" | "reject" | "revision" | null
export type PendingReportAction = "download" | "compare" | null

export function findSimilarProfiles(
    profiles: RiskProfile[],
    selectedProfile: RiskProfile,
    limit = 3
) {
    return profiles
        .filter(
            (item) =>
                item.id !== selectedProfile.id &&
                item.category.toLowerCase() ===
                    selectedProfile.category.toLowerCase()
        )
        .slice(0, limit)
}
