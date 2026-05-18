import ScoreGauge from "./score-gauge"
import VariableContribution from "./variable-contribution"

type GaugeData = {
    score: number | undefined,
}

export default function ScorePanel({ score }: GaugeData) {

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

            <div className="flex flex-col gap-3 items-center">
                <h1 className="text-muted-foreground text-xl">
                    <span className="text-black text-6xl font-bold">
                        {score}
                    </span>/100
                </h1>

                <h1 className={`w-fit text-md text-white px-4 py-2 rounded-full ${riskColor}`}>
                    {riskLabel}
                </h1>

                <p className="text-muted-foreground text-sm">
                    Di atas 65% pengajuan BPR bulan ini
                </p>
            </div>

            <hr />

            {/* gauge */}
            <ScoreGauge
                score={score}
            />

            <hr />

            <VariableContribution />

        </div>
    )
}