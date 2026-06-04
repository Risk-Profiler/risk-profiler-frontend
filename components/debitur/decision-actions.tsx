"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"

import { getDecisionDisplay, isDecisionFinal } from "@/lib/risk-profile"

type DecisionActionsProps = {
    status?: string
    onReview: () => void
    onDecline: () => void
    onApprove: () => void
}

export default function DecisionActions({
  status,
  onReview,
  onDecline,
  onApprove,
}: DecisionActionsProps) {
  const [changingStatus, setChangingStatus] = useState<string | null>(null)
  const finalDecision = isDecisionFinal(status)
  const display = getDecisionDisplay(status)
  const changingDecision = finalDecision && changingStatus === status

  if (finalDecision && !changingDecision) {
    return (
      <div className={`flex w-full flex-col gap-3 rounded-xl border bg-background p-3 shadow-sm lg:w-auto xl:flex-row xl:items-center ${display.borderClassName}`}>
        <div className="min-w-0">
          <p className={`w-fit rounded-full px-3 py-1 text-sm font-semibold leading-none ${display.className}`}>
            {display.title}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-snug text-muted-foreground">
            {display.description}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:pl-2">
          <button
            onClick={onReview}
            className="rounded-lg border px-3.5 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            Lihat Detail
          </button>
          <button
            onClick={() => setChangingStatus(status ?? "")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition hover:bg-muted"
          >
            <Pencil size={15} />
            Ubah Keputusan
          </button>
        </div>
      </div>
    )
  }

  return (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-fit">
        {finalDecision && (
            <button
                onClick={() => setChangingStatus(null)}
                className="cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
            >
                Batal Ubah
            </button>
        )}

        <button
            onClick={onDecline}
            className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
            Decline
        </button>

        <button
            onClick={onReview}
            className="cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
        >
            Review
        </button>

        <button
            onClick={onApprove}
            className="cursor-pointer rounded-lg bg-green-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
        >
            Approve
        </button>

        </div>
    )
}
