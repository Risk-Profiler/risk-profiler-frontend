"use client"

import type { ReactNode } from "react"
import { BookOpen, CircleAlert, Info } from "lucide-react"

import type { FieldInfo } from "@/lib/data-input"

type FieldErrorProps = {
    label: string
    info: FieldInfo
    onLearnMore: (info: FieldInfo) => void
    error?: string
    children: ReactNode
}

export default function FieldError({
    label,
    info,
    onLearnMore,
    error,
    children,
}: FieldErrorProps) {
    return (
        <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5">
                <label className="text-sm font-semibold">
                    {label}
                </label>
                <FieldHelp info={info} onLearnMore={onLearnMore} />
            </div>

            {children}

            {error && (
                <p className="flex items-start gap-1 text-xs leading-snug text-red-600">
                    <CircleAlert size={14} />
                    {error}
                </p>
            )}
        </div>
    )
}

function FieldHelp({
    info,
    onLearnMore,
}: {
    info: FieldInfo
    onLearnMore: (info: FieldInfo) => void
}) {
    return (
        <div className="group relative flex">
            <button
                type="button"
                aria-label={`Info ${info.title}`}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition hover:bg-light-green-accent hover:text-green-accent focus:bg-light-green-accent focus:text-green-accent focus:outline-none focus:ring-2 focus:ring-green-accent/20"
            >
                <Info size={14} />
            </button>

            <div className="pointer-events-none absolute left-0 top-5 z-30 w-64 translate-y-1 rounded-lg border bg-popover p-3 text-popover-foreground opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <p className="text-xs leading-relaxed text-muted-foreground">
                    {info.summary}
                </p>
                <button
                    type="button"
                    onClick={() => onLearnMore(info)}
                    className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold text-green-accent transition hover:bg-light-green-accent focus:outline-none focus:ring-2 focus:ring-green-accent/20"
                >
                    <BookOpen size={13} />
                    Pelajari lebih lanjut
                </button>
            </div>
        </div>
    )
}
