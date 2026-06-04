"use client"

import { gaugeCategories } from "@/lib/gauges"
import { motion } from "framer-motion"

type GaugeData = {
    score: number | undefined
}

export default function ScoreGauge({ score }: GaugeData) {
    const safeScore = Math.min(100, Math.max(0, score ?? 0))
    const indicatorLeft = `clamp(0.75rem, ${safeScore}%, calc(100% - 0.75rem))`

    return (
        <div className="overflow-hidden space-y-8">
            <div className="relative pb-12">
                <div className="flex h-6 overflow-hidden rounded-full sm:h-8">
                    <div className="w-1/4 bg-very-low-score" />
                    <div className="w-1/4 bg-medium-score" />
                    <div className="w-1/4 bg-good-score" />
                    <div className="w-1/4 bg-very-good-score" />
                </div>

                <motion.div
                    className="absolute top-6 -translate-x-1/2 sm:top-8"
                    style={{ left: indicatorLeft }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="mx-auto h-5 w-[2px] bg-foreground sm:h-6" />
                    <div className="mx-auto h-2 w-2 rounded-full bg-foreground" />

                    <p className="mt-1 min-w-8 text-center text-xs font-medium sm:text-sm">
                        {score ?? "-"}
                    </p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {gaugeCategories.map((category) => (
                    <div
                        key={category.id}
                        className="flex min-w-0 items-center gap-2"
                    >
                        <div
                            className={`${category.color} h-2 w-2 shrink-0 rounded-full`}
                        />

                        <div className="min-w-0 text-xs sm:text-sm">
                            <h1 className="break-words">{category.range}</h1>

                            <p className="break-words text-muted-foreground">
                                {category.category}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
