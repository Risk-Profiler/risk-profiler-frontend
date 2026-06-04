"use client"

import { motion } from "framer-motion"

type GaugeData = {
    score: number | undefined,
    riskLabel: string | undefined,
    riskColor: string | undefined
}

export default function ScoreHeader({ score, riskLabel, riskColor } : GaugeData){
    const safeScore = Math.min(100, Math.max(0, score ?? 0))
    const scoreSummary =
        safeScore >= 75
            ? "Profil kuat untuk diproses lebih lanjut"
            : safeScore >= 50
              ? "Profil membutuhkan review analis"
              : "Profil membutuhkan mitigasi risiko tambahan"

    return (
         <div className="flex flex-col gap-3 items-center">
            <h1 className="text-muted-foreground text-xl">
                <motion.span
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="inline-block text-6xl font-bold text-foreground"
                >
                    {score ?? "-"}
                </motion.span>/100
            </h1>
            <h1 className={`w-fit rounded-full px-4 py-2 text-sm font-semibold text-white ${riskColor}`}>
                {riskLabel}
            </h1>
            <p className="text-center text-sm text-muted-foreground">
                {scoreSummary}
            </p>
        </div>
    )
}
