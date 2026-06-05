"use client"

import { CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    calculateAgeInMonths,
    formatAgeLabel,
    formatLongDate,
    parseDateInput,
} from "@/lib/data-input"

type BusinessAgePickerProps = {
    value?: string
    max: string
    onChange: (value: string) => void
}

export default function BusinessAgePicker({
    value,
    max,
    onChange,
}: BusinessAgePickerProps) {
    const startDate = value ? parseDateInput(value) : null
    const today = new Date()
    const ageInMonths = startDate
        ? calculateAgeInMonths(startDate, today)
        : null
    const startDateLabel = startDate
        ? formatLongDate(startDate)
        : "Pilih tanggal mulai"
    const ageLabel =
        ageInMonths === null ? "Belum dihitung" : formatAgeLabel(ageInMonths)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-full justify-between rounded-lg border-input bg-background px-3.5 py-3 text-left hover:border-green-accent hover:bg-light-green-accent/50 aria-expanded:border-green-accent aria-expanded:bg-light-green-accent/60"
                >
                    <span className="min-w-0 space-y-1">
                        <span className="block text-xs font-semibold text-green-accent">
                            Tanggal mulai
                        </span>
                        <span className="block truncate text-sm font-semibold text-foreground">
                            {startDateLabel}
                        </span>
                        <span className="block text-xs font-medium text-muted-foreground">
                            Sampai hari ini: {formatLongDate(today)}
                        </span>
                    </span>
                    <CalendarDays
                        size={18}
                        className="ml-3 shrink-0 text-green-accent"
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[min(22rem,calc(100vw-2rem))] border-green-accent/20"
            >
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold">
                            Usia UMKM
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            Pilih tanggal mulai usaha. Sistem menghitung usia dari tanggal itu sampai hari ini.
                        </p>
                    </div>

                    <Input
                        type="date"
                        value={value ?? ""}
                        max={max}
                        onChange={(event) => onChange(event.target.value)}
                        className="border-green-accent/30 focus:border-green-accent focus:ring-green-accent/20"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border bg-light-green-accent/45 p-3">
                            <p className="text-[11px] font-semibold uppercase text-green-accent">
                                Sampai
                            </p>
                            <p className="mt-1 text-xs font-medium leading-snug text-foreground">
                                Hari ini
                            </p>
                        </div>
                        <div className="rounded-lg border border-green-accent/20 bg-light-green-accent p-3">
                            <p className="text-[11px] font-semibold uppercase text-green-accent">
                                Usia
                            </p>
                            <p className="mt-1 text-xs font-bold leading-snug text-foreground">
                                {ageLabel}
                            </p>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
