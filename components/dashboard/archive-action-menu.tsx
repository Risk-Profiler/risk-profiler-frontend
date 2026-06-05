"use client"

import type { ReactNode } from "react"
import {
    CheckCircle2,
    ChevronRight,
    Eye,
    Loader2,
    MoreHorizontal,
    Trash2,
    XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import type { DashboardPendingAction } from "@/lib/dashboard"
import {
    getDecisionState,
    type RiskProfile,
} from "@/lib/risk-profile"

type ArchiveActionMenuProps = {
    profile: RiskProfile
    pendingAction: DashboardPendingAction | null
    disabled: boolean
    onReview: () => void
    onApprove: () => void
    onDecline: () => void
    onRevise: () => void
    onDelete: () => void
}

export default function ArchiveActionMenu({
    profile,
    pendingAction,
    disabled,
    onReview,
    onApprove,
    onDecline,
    onRevise,
    onDelete,
}: ArchiveActionMenuProps) {
    const decisionState = getDecisionState(profile.status)
    const hasDecision = decisionState !== "pending"

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Buka aksi untuk ${profile.name}`}
                    disabled={disabled}
                    className="text-muted-foreground hover:bg-light-green-accent hover:text-green-accent aria-expanded:bg-light-green-accent aria-expanded:text-green-accent"
                >
                    <MoreHorizontal size={18} />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-52 p-2"
            >
                <div className="grid gap-1">
                    <MenuAction
                        icon={<Eye size={16} />}
                        label="Lihat detail"
                        onClick={onReview}
                        loading={pendingAction === "review"}
                        disabled={disabled}
                    />

                    <div className="my-1 border-t" />

                    <p className="px-3 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
                        {hasDecision ? "Ubah keputusan" : "Keputusan"}
                    </p>

                    <MenuAction
                        icon={<CheckCircle2 size={16} />}
                        label="Terima"
                        meta={decisionState === "approved" ? "Saat ini" : undefined}
                        onClick={onApprove}
                        loading={pendingAction === "approve"}
                        disabled={disabled || decisionState === "approved"}
                        className="text-green-accent hover:bg-light-green-accent hover:text-green-accent"
                    />

                    <MenuAction
                        icon={<XCircle size={16} />}
                        label="Tolak"
                        meta={decisionState === "rejected" ? "Saat ini" : undefined}
                        onClick={onDecline}
                        loading={pendingAction === "reject"}
                        disabled={disabled || decisionState === "rejected"}
                        className="text-red-accent hover:bg-light-red-accent hover:text-red-accent"
                    />

                    <MenuAction
                        icon={<ChevronRight size={16} />}
                        label="Revisi"
                        meta={decisionState === "revision" ? "Saat ini" : undefined}
                        onClick={onRevise}
                        loading={pendingAction === "revise"}
                        disabled={disabled || decisionState === "revision"}
                        className="text-yellowish-accent hover:bg-light-yellowish-accent hover:text-yellowish-accent"
                    />

                    <div className="my-1 border-t" />
                    <MenuAction
                        icon={<Trash2 size={16} />}
                        label="Delete"
                        onClick={onDelete}
                        loading={pendingAction === "delete"}
                        disabled={disabled}
                        className="text-red-accent hover:bg-light-red-accent hover:text-red-accent"
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}

function MenuAction({
    icon,
    label,
    meta,
    onClick,
    className = "",
    disabled = false,
    loading = false,
}: {
    icon: ReactNode
    label: string
    meta?: string
    onClick: () => void
    className?: string
    disabled?: boolean
    loading?: boolean
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className={`flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold transition hover:bg-muted focus:bg-muted focus:outline-none disabled:cursor-default disabled:opacity-60 disabled:hover:bg-transparent ${className}`}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span>{label}</span>
                {meta && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                        {meta}
                    </span>
                )}
            </span>
        </button>
    )
}
