"use client"

import { motion } from "framer-motion"
import type { ContributionItem } from "@/lib/risk-profile"

type VariableContributionProps = {
    contributions: ContributionItem[]
}

export default function VariableContribution({
    contributions,
}: VariableContributionProps) {
    if (contributions.length === 0) {
        return (
            <div className="space-y-3 overflow-hidden">
                <h1 className="text-lg sm:text-xl font-bold">
                    Faktor Penilaian
                </h1>
                <p className="text-sm text-muted-foreground">
                    Belum ada faktor model yang tersedia. Jalankan analisis
                    ulang setelah server analisis aktif.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 overflow-hidden">
            <h1 className="text-lg sm:text-xl font-bold">
                Faktor Penilaian
            </h1>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto] sm:gap-4">
                {contributions.map((item) => {
                    const width = Math.min(100, Math.max(0, item.value))

                    return (
                        <div
                            key={item.id}
                            className="contents"
                        >
                            <p className="break-words text-sm sm:text-base text-muted-foreground">
                                {item.label}
                            </p>

                            <div className="h-4 sm:h-5 w-full overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    className={`h-full rounded-full ${item.impact >= 0 ? "bg-green-accent" : "bg-red-accent"}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${width}%` }}
                                    transition={{ duration: 0.45, ease: "easeOut" }}
                                />
                            </div>

                            <p className={`text-sm sm:text-base font-medium ${item.impact >= 0 ? "text-green-accent" : "text-red-accent"}`}>
                                {item.impact >= 0 ? "+" : ""}
                                {item.impact}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
