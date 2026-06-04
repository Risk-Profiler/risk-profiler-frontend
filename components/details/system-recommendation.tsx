"use client"

import SystemRecommendationSkeleton from "../skeletons/details/system-recommendation"
import { CircleCheck } from "lucide-react"
import { motion } from "framer-motion"

type SystemRecommendationProps = {
    recommendations: string[]
    score: number | undefined
    band: string | undefined
    confidence: string | undefined
    loading?: boolean
}

export default function SystemRecommendation({
    recommendations,
    score,
    band,
    confidence,
    loading = false,
}: SystemRecommendationProps) {
    if (loading) {
        return <SystemRecommendationSkeleton />
    }

    return (
        <div className="overflow-hidden border-y p-4 lg:p-8 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-lg sm:text-xl font-bold">
                        Rekomendasi Analisis
                    </h1>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-light-green-accent px-3 py-2 font-medium text-green-accent">
                        Skor {score ?? "-"}/100
                    </span>
                    <span className="rounded-full border px-3 py-2 font-medium text-muted-foreground">
                        Band {band ?? "-"}
                    </span>
                    <span className="rounded-full border px-3 py-2 font-medium text-muted-foreground">
                        Keyakinan {confidence ?? "-"}
                    </span>
                </div>
            </div>

            <hr />

            <div className="space-y-4">
                {recommendations.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        Rekomendasi belum tersedia untuk data ini.
                    </p>
                )}

                {recommendations.map((recommendation, index) => (
                    <motion.div
                        key={recommendation}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.22, delay: index * 0.04 }}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center"
                    >
                        <div className="flex items-start gap-2 min-w-0">
                            <CircleCheck
                                fill="green"
                                color="white"
                                className="mt-1 shrink-0"
                            />

                            <h1 className="break-words text-base sm:text-lg">
                                {recommendation}
                            </h1>
                        </div>
                    </motion.div>
                ))}
            </div>

        </div>
    )
}
