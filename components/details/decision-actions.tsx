"use client"

import { useState } from "react"
import { XIcon, ChevronRight, Check, Pencil, Loader2 } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getDecisionDisplay, isDecisionFinal } from "@/lib/risk-profile"

type DecisionActionsProps = {
    status?: string
    pendingAction?: "approve" | "reject" | "revision" | null
    onReject: () => void
    onRevise: () => void
    onApprove: () => void
}

export default function DecisionActions({
    status,
    pendingAction = null,
    onReject,
    onRevise,
    onApprove,
}: DecisionActionsProps) {
    const [changingStatus, setChangingStatus] = useState<string | null>(null)
    const finalDecision = isDecisionFinal(status)
    const display = getDecisionDisplay(status)
    const changingDecision = finalDecision && changingStatus === status

    const actions = [
        {
            id: "reject",
            label: "Rekomendasikan Penolakan",
            icon: XIcon,
            onClick: onReject,
            className: "bg-light-red-accent text-red-accent",
        },
        {
            id: "revision",
            label: "Ajukan Revisi Plafon",
            icon: ChevronRight,
            onClick: onRevise,
            className: "bg-light-yellowish-accent text-yellowish-accent",
        },
        {
            id: "approve",
            label: "Rekomendasikan Approval",
            icon: Check,
            onClick: onApprove,
            className: "bg-light-green-accent text-green-accent",
        },
    ]

    if (finalDecision && !changingDecision) {
        const isPending = Boolean(pendingAction)

        return (
            <div className="sticky bottom-0 border-t bg-background p-4">
                <div className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${display.borderClassName}`}>
                    <div>
                        <p className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${display.className}`}>
                            {display.title}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {display.description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setChangingStatus(status ?? "")}
                        disabled={isPending}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition hover:bg-muted disabled:cursor-wait disabled:opacity-70 sm:w-fit"
                    >
                        {isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Pencil size={16} />
                        )}
                        {isPending ? "Menyimpan keputusan" : "Ubah Keputusan"}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="sticky bottom-0 bg-background">
            {finalDecision && (
                <div className="border-t px-4 py-3">
                    <div className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            Pilih keputusan baru untuk menggantikan status saat ini.
                        </p>
                        <button
                            type="button"
                            onClick={() => setChangingStatus(null)}
                            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                        >
                            Batal Ubah
                        </button>
                    </div>
                </div>
            )}
            <div className="hidden lg:grid grid-cols-3 text-sm font-semibold border-t">
                {actions.map((action, index) => {
                    const Icon = action.icon
                    const isPending = pendingAction === action.id

                    return (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            disabled={Boolean(pendingAction)}
                            className={`flex justify-center items-center py-6 gap-2 hover:brightness-95 transition cursor-pointer disabled:cursor-wait disabled:opacity-75 ${action.className} ${
                                index === 1 ? "border-x" : ""
                            }`}
                        >
                            {isPending ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Icon size={20} />
                            )}
                            <span className="underline">
                                {isPending ? "Menyimpan keputusan" : action.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            <Carousel className="relative block lg:hidden text-sm font-semibold border-t">
                <CarouselContent>
                    {actions.map((action) => {
                        const Icon = action.icon
                        const isPending = pendingAction === action.id

                        return (
                            <CarouselItem key={action.label}>
                                <button
                                    onClick={action.onClick}
                                    disabled={Boolean(pendingAction)}
                                    className={`flex w-full justify-center items-center py-6 gap-2 hover:brightness-95 transition cursor-pointer disabled:cursor-wait disabled:opacity-75 ${action.className}`}
                                >
                                    {isPending ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Icon size={20} />
                                    )}
                                    <span className="underline">
                                        {isPending ? "Menyimpan keputusan" : action.label}
                                    </span>
                                </button>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 bg-black text-white" />
                <CarouselNext className="absolute right-4 bg-black text-white" />
            </Carousel>
        </div>
    )
}
