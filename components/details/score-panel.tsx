import ScoreHeader from "./score-header"
import ScoreHeaderSkeleton from "../skeletons/details/score-header"

import ScoreGauge from "./score-gauge"
import ScoreGaugeSkeleton from "../skeletons/details/score-gauge"

import VariableContribution from "./variable-contribution"
import VariableContributionSkeleton from "../skeletons/details/variable-contribution"
import { getRiskColor, getRiskLabel, type ContributionItem } from "@/lib/risk-profile"

type GaugeData = {
    score: number | undefined
    risk: string | undefined
    contributions: ContributionItem[]
    loading?: boolean
}

export default function ScorePanel({
    score,
    risk,
    contributions,
    loading = false
}: GaugeData) {
    const riskLabel = getRiskLabel(risk ?? "High Risk").toUpperCase()
    const riskColor = getRiskColor(risk ?? "High Risk")

    return (
        <div className="p-4 lg:p-8 space-y-8 border-r">

            {/* header */}
            {loading ? (
                <ScoreHeaderSkeleton />
            ) : (
                <ScoreHeader 
                    score={score}
                    riskLabel={riskLabel}
                    riskColor={riskColor}
                />
            )}

            <hr />

            {/* gauge */}
            {loading ? (
                <ScoreGaugeSkeleton />
            ) : (
                <ScoreGauge
                    score={score}
                />
            )}

            <hr />

            {/* contribution */}
            {loading ? (
                <VariableContributionSkeleton />
            ) : (
                <VariableContribution contributions={contributions} />
            )}

        </div>
    )
}
