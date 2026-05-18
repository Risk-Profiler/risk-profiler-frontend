"use client"

import { useEffect, useState } from "react"

import DetailsHeader from "@/components/details/details-header"
import ScorePanel from "@/components/details/score-panel"
import ContributionBreakdown from "@/components/details/contribution-breakdown"
import SystemRecommendation from "@/components/details/system-recommendation"
import ReportActions from "@/components/details/report-actions"
import DecisionActions from "@/components/details/decision-actions"

type DebiturData = {
    id: string
    name: string
    owner: string
    category: string
    score: number
    risk: string
    limit: number
    status: string
    band?: string
    probability?: number
}

export default function Details() {
    const [selectedDebitur, setSelectedDebitur] =
        useState<DebiturData | null>(null)

    useEffect(() => {
        const storedDebitur = localStorage.getItem("selected_debitur")

        if (storedDebitur) {
        setSelectedDebitur(JSON.parse(storedDebitur))
        }
    }, [])

    return (
        <main>
            <DetailsHeader
                id={selectedDebitur?.id ?? "-"}
                name={selectedDebitur?.name ?? "-"}
                recommended_limit={selectedDebitur?.limit}
                band={selectedDebitur?.band}
            />

            <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]">
                <ScorePanel score={selectedDebitur?.score} />

                <ContributionBreakdown />
            </div>

            <SystemRecommendation />

            <ReportActions />

            <DecisionActions />
        </main>
    )
}