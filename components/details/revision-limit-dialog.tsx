"use client"

import { type FormEvent, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CircleAlert, X } from "lucide-react"

type RevisionLimitDialogProps = {
    open: boolean
    currentLimit: number
    onClose: () => void
    onSubmit: (limit: number) => void
}

const formatRupiah = (value: number) =>
    value.toLocaleString("id-ID")

export default function RevisionLimitDialog({
    open,
    currentLimit,
    onClose,
    onSubmit,
}: RevisionLimitDialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <RevisionLimitDialogContent
                    key={currentLimit}
                    currentLimit={currentLimit}
                    onClose={onClose}
                    onSubmit={onSubmit}
                />
            )}
        </AnimatePresence>
    )
}

function RevisionLimitDialogContent({
    currentLimit,
    onClose,
    onSubmit,
}: Omit<RevisionLimitDialogProps, "open">) {
    const [value, setValue] = useState(formatRupiah(currentLimit))
    const [error, setError] = useState("")

    const parsedValue = useMemo(
        () => Number(value.replace(/[^\d]/g, "")),
        [value]
    )

    const handleChange = (input: string) => {
        const numericValue = Number(input.replace(/[^\d]/g, ""))
        setValue(numericValue ? formatRupiah(numericValue) : "")
        setError("")
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
            setError("Nominal plafon tidak valid.")
            return
        }

        onSubmit(parsedValue)
    }

    return (
        <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.form
                role="dialog"
                aria-modal="true"
                aria-labelledby="revision-limit-title"
                className="w-full max-w-md rounded-2xl border bg-background p-5 shadow-2xl"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={(event) => event.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2
                            id="revision-limit-title"
                            className="text-lg font-bold"
                        >
                            Ajukan Revisi Plafon
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Plafon saat ini Rp {formatRupiah(currentLimit)}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border transition hover:bg-muted"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="mt-5 space-y-2">
                    <label htmlFor="revision-limit" className="text-sm font-medium">
                        Plafon revisi
                    </label>
                    <div className="flex items-center rounded-xl border bg-background px-4 py-3 transition focus-within:border-green-accent focus-within:ring-2 focus-within:ring-green-accent/15">
                        <span className="mr-2 text-sm text-muted-foreground">
                            Rp
                        </span>
                        <input
                            id="revision-limit"
                            value={value}
                            onChange={(event) =>
                                handleChange(event.target.value)
                            }
                            inputMode="numeric"
                            autoFocus
                            className="w-full bg-transparent text-base font-semibold outline-none"
                            placeholder="0"
                        />
                    </div>

                    {error && (
                        <p className="flex items-center gap-1 text-xs text-red-600">
                            <CircleAlert size={14} />
                            {error}
                        </p>
                    )}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border px-5 py-3 text-sm font-medium transition hover:bg-muted"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-green-accent px-5 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!Number.isFinite(parsedValue) || parsedValue <= 0}
                    >
                        Ajukan Revisi
                    </button>
                </div>
            </motion.form>
        </motion.div>
    )
}
