"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import DecisionActions from "@/components/debitur/decision-actions"

type DebiturData = {
    id: string
    name: string
    owner: string
    category: string
    score: number
    risk: string
    limit: number
    status: string
}

export default function Debitur() {
    const router = useRouter()

    const [umkmData, setUmkmData] = useState<DebiturData[]>([])

    useEffect(() => {
        const stored = localStorage.getItem("debitur_list")

        if (stored) {
            try {
                const parsedData = JSON.parse(stored)

                if (Array.isArray(parsedData)) {
                    setUmkmData(parsedData)
                }
            } catch (error) {
                console.error("Failed to parse debitur_list:", error)
                setUmkmData([])
            }
        }
    }, [])

    const handleReview = (umkm: DebiturData) => {
        localStorage.setItem("selected_debitur", JSON.stringify(umkm))
        router.push("/details")
    }

    const handleDelete = (id: string) => {
        const updatedData = umkmData.filter((umkm) => umkm.id !== id)

        setUmkmData(updatedData)
        localStorage.setItem("debitur_list", JSON.stringify(updatedData))
    }

    return (
        <div className="overflow-hidden space-y-6 p-4 sm:p-6 lg:p-8">
            {/* title */}
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                    Admin Dashboard
                </p>

                <h1 className="break-words text-2xl sm:text-3xl lg:text-4xl font-bold">
                    Review Pengajuan UMKM
                </h1>
            </div>

            {/* empty state */}
            {umkmData.length === 0 && (
                <div className="rounded-3xl border border-dashed p-8 sm:p-12 lg:p-16 text-center">
                    <h1 className="text-xl sm:text-2xl font-bold">
                        Belum ada pengajuan
                    </h1>

                    <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                        Data debitur akan muncul setelah form prediction
                        disubmit.
                    </p>
                </div>
            )}

            {/* cards */}
            <div className="grid gap-4 sm:gap-6">
                {umkmData.map((umkm) => (
                    <div
                        key={umkm.id}
                        className="overflow-hidden rounded-3xl border bg-background p-4 sm:p-6 transition hover:shadow-md"
                    >
                        {/* top */}
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0 space-y-2">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="break-words text-xl sm:text-2xl font-bold">
                                        {umkm.name}
                                    </h1>

                                    <p className="rounded-full bg-blue-card px-4 py-1 text-xs sm:text-sm font-medium text-blue-card-txt">
                                        {umkm.status}
                                    </p>
                                </div>

                                <p className="break-words text-sm sm:text-base text-muted-foreground">
                                    {umkm.id} • {umkm.owner}
                                </p>
                            </div>

                            <div className="lg:text-right">
                                <p className="text-sm text-muted-foreground">
                                    Recommended Limit
                                </p>

                                <h1 className="break-words text-2xl sm:text-3xl font-bold">
                                    Rp{" "}
                                    {umkm.limit.toLocaleString("id-ID")}
                                </h1>
                            </div>
                        </div>

                        {/* middle */}
                        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-2xl border p-4">
                                <p className="text-sm text-muted-foreground">
                                    Risk Score
                                </p>

                                <h1 className="mt-2 text-2xl sm:text-3xl font-bold">
                                    {umkm.score}
                                </h1>
                            </div>

                            <div className="rounded-2xl border p-4">
                                <p className="text-sm text-muted-foreground">
                                    Risk Level
                                </p>

                                <h1 className="mt-2 break-words text-base sm:text-lg font-semibold">
                                    {umkm.risk}
                                </h1>
                            </div>

                            <div className="rounded-2xl border p-4">
                                <p className="text-sm text-muted-foreground">
                                    Category
                                </p>

                                <h1 className="mt-2 break-words text-base sm:text-lg font-semibold">
                                    {umkm.category}
                                </h1>
                            </div>

                            <div className="rounded-2xl border p-4">
                                <p className="text-sm text-muted-foreground">
                                    Decision Confidence
                                </p>

                                <h1 className="mt-2 text-base sm:text-lg font-semibold text-green-600">
                                    High
                                </h1>
                            </div>
                        </div>

                        {/* bottom */}
                        <div className="mt-6 sm:mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <button
                                onClick={() => handleDelete(umkm.id)}
                                className="w-full lg:w-fit rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm sm:text-base font-medium text-red-600 transition hover:bg-red-100"
                            >
                                Delete
                            </button>

                            <DecisionActions
                                onReview={() => handleReview(umkm)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}