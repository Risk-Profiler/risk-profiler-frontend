"use client"

import { X } from "lucide-react"

import type { FieldInfo } from "@/lib/data-input"

type InfoModalProps = {
    info: FieldInfo
    onClose: () => void
}

export default function InfoModal({
    info,
    onClose,
}: InfoModalProps) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="field-info-title"
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
        >
            <div
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-md rounded-xl border bg-background p-5 shadow-xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase text-green-accent">
                            Panduan Field
                        </p>
                        <h2
                            id="field-info-title"
                            className="mt-1 text-xl font-bold"
                        >
                            {info.title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="Tutup penjelasan"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-green-accent/20"
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {info.detail}
                </p>
            </div>
        </div>
    )
}
