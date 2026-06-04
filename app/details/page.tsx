"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import DetailsHeader from "@/components/details/details-header"
import ScorePanel from "@/components/details/score-panel"
import ContributionBreakdown from "@/components/details/contribution-breakdown"
import SystemRecommendation from "@/components/details/system-recommendation"
import ReportActions from "@/components/details/report-actions"
import DecisionActions from "@/components/details/decision-actions"
import RevisionLimitDialog from "@/components/details/revision-limit-dialog"
import { downloadRiskReportPdf } from "@/lib/report"
import type { RiskProfile } from "@/lib/risk-profile"
import {
    readProfiles,
    readSelectedProfile,
    saveSelectedProfile,
    upsertProfile,
} from "@/lib/risk-storage"

export default function Details() {
    const [selectedDebitur, setSelectedDebitur] =
        useState<RiskProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [similarDebitur, setSimilarDebitur] = useState<RiskProfile[]>([])
    const [revisionDialogOpen, setRevisionDialogOpen] = useState(false)

    useEffect(() => {
        const hydrated = readSelectedProfile()

        if (hydrated) {
            window.setTimeout(() => setSelectedDebitur(hydrated), 0)
            saveSelectedProfile(hydrated)
        }

        window.setTimeout(() => setLoading(false), 0)
    }, [])

    const persistSelected = (updatedDebitur: RiskProfile) => {
        setSelectedDebitur(updatedDebitur)
        saveSelectedProfile(updatedDebitur)
        upsertProfile(updatedDebitur)
    }

    const handleDecision = (status: string, note: string) => {
        if (!selectedDebitur) return

        persistSelected({
            ...selectedDebitur,
            status,
            decisionNote: note,
        })

        toast.success("Keputusan tersimpan", {
            description: `${selectedDebitur.name} sekarang berstatus ${status}.`,
        })
    }

    const handleRevise = () => {
        if (!selectedDebitur) return

        setRevisionDialogOpen(true)
    }

    const handleRevisionSubmit = (revisionLimit: number) => {
        if (!selectedDebitur) return

        persistSelected({
            ...selectedDebitur,
            status: "Revision Requested",
            limit: revisionLimit,
            recommended_limit: revisionLimit,
            revisionLimit,
            decisionNote: `Analis mengajukan revisi plafon ke Rp ${revisionLimit.toLocaleString("id-ID")}.`,
        })

        toast.success("Revisi plafon diajukan", {
            description: `Plafon baru: Rp ${revisionLimit.toLocaleString("id-ID")}.`,
        })
        setRevisionDialogOpen(false)
    }

    const handleCompare = () => {
        if (!selectedDebitur) return

        const hydratedList = readProfiles()
        const similar = hydratedList
            .filter(
                (item) =>
                    item.id !== selectedDebitur.id &&
                    item.category.toLowerCase() ===
                        selectedDebitur.category.toLowerCase()
            )
            .slice(0, 3)

        setSimilarDebitur(similar)

        if (similar.length === 0) {
            toast.info("Belum ada debitur serupa", {
                description:
                    "Tambahkan UMKM dengan kategori yang sama untuk perbandingan.",
            })
        } else {
            toast.success("Debitur serupa ditemukan", {
                description: `${similar.length} data pembanding ditampilkan.`,
            })
        }
    }

    if (!loading && !selectedDebitur) {
        return (
            <main className="p-4 lg:p-8 space-y-4">
                <h1 className="text-2xl font-bold">
                    Belum ada data analisis
                </h1>
                <p className="text-muted-foreground">
                    Isi form UMKM terlebih dahulu agar halaman detail bisa
                    menampilkan hasil scoring.
                </p>
                <Link
                    href="/data_input"
                    className="inline-flex rounded-xl bg-green-accent px-5 py-3 font-medium text-white"
                >
                    Input Data UMKM
                </Link>
            </main>
        )
    }

    return (
        <main>
            <DetailsHeader
                id={selectedDebitur?.id ?? "-"}
                name={selectedDebitur?.name ?? "-"}
                recommended_limit={selectedDebitur?.limit}
                band={selectedDebitur?.band}
                bandRange={selectedDebitur?.bandRange}
                score={selectedDebitur?.score}
                scorePercentile={selectedDebitur?.scorePercentile}
                status={selectedDebitur?.status}
                loading={loading}
            />

            <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]">
                <ScorePanel
                    score={selectedDebitur?.score}
                    risk={selectedDebitur?.risk}
                    contributions={selectedDebitur?.contributions ?? []}
                    loading={loading}
                />

                <ContributionBreakdown
                    dataSources={selectedDebitur?.dataSources ?? []}
                    breakdown={selectedDebitur?.breakdown ?? []}
                    loading={loading}
                />
            </div>

            <SystemRecommendation
                recommendations={selectedDebitur?.recommendations ?? []}
                score={selectedDebitur?.score}
                band={selectedDebitur?.band}
                confidence={selectedDebitur?.confidence}
                loading={loading}
            />

            {selectedDebitur?.decisionNote && (
                <section className="border-b p-4 lg:p-8">
                    <h1 className="text-lg sm:text-xl font-bold">
                        Catatan Keputusan
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                        {selectedDebitur.decisionNote}
                    </p>
                </section>
            )}

            {similarDebitur.length > 0 && (
                <section className="border-b p-4 lg:p-8 space-y-4">
                    <h1 className="text-lg sm:text-xl font-bold">
                        Debitur Serupa
                    </h1>
                    <div className="grid gap-3 md:grid-cols-3">
                        {similarDebitur.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl border p-4"
                            >
                                <h2 className="font-semibold">
                                    {item.name}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Skor {item.score} - {item.riskLabel}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Rp {item.limit.toLocaleString("id-ID")}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <ReportActions
                onDownload={() => {
                    if (!selectedDebitur) return

                    downloadRiskReportPdf(selectedDebitur)
                    toast.success("Laporan PDF dibuat", {
                        description: `File risk-report-${selectedDebitur.id}.pdf sedang diunduh.`,
                    })
                }}
                onCompare={handleCompare}
            />

            <DecisionActions
                onReject={() =>
                    handleDecision(
                        "Rejected",
                        "Analis merekomendasikan penolakan pengajuan."
                    )
                }
                onRevise={handleRevise}
                onApprove={() =>
                    handleDecision(
                        "Approved",
                        "Analis merekomendasikan approval pengajuan."
                    )
                }
            />

            <RevisionLimitDialog
                open={revisionDialogOpen}
                currentLimit={selectedDebitur?.limit ?? 0}
                onClose={() => setRevisionDialogOpen(false)}
                onSubmit={handleRevisionSubmit}
            />
        </main>
    )
}
