import ScoreHeader from "./score-header"
import ScoreHeaderSkeleton from "../skeletons/details/score-header"

import ScoreGauge from "./score-gauge"
import ScoreGaugeSkeleton from "../skeletons/details/score-gauge"

import VariableContribution from "./variable-contribution"
import VariableContributionSkeleton from "../skeletons/details/variable-contribution"

type GaugeData = {
    score: number | undefined
    loading?: boolean
}

export default function ScorePanel({
    score,
    loading = false
}: GaugeData) {

    let riskLabel = "RESIKO RENDAH"
    let riskColor = "bg-green-accent"

    if ((score ?? 0) >= 70) {
        riskLabel = "RESIKO RENDAH"
        riskColor = "bg-green-accent"
    } 
    else if ((score ?? 0) >= 50) {
        riskLabel = "RESIKO SEDANG"
        riskColor = "bg-yellowish-accent"
    } 
    else {
        riskLabel = "RESIKO TINGGI"
        riskColor = "bg-red-accent"
    }

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
                <VariableContribution />
            )}

        </div>
    )
}