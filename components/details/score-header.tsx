type GaugeData = {
    score: number | undefined,
    riskLabel: string | undefined,
    riskColor: string | undefined
}

export default function ScoreHeader({ score, riskLabel, riskColor } : GaugeData){
    return (
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
    )
}