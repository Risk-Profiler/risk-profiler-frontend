"use client"

import { Check, ListFilter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import {
    formatCurrency,
    formatCurrencyInput,
    parseCurrencyInput,
    sortOptions,
    type SortOption,
} from "@/lib/dashboard"

type SelectedFilterChipProps = {
    label: string
    onClear: () => void
}

export function SelectedFilterChip({
    label,
    onClear,
}: SelectedFilterChipProps) {
    return (
        <span className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full bg-light-green-accent px-3 py-1 text-xs font-semibold text-green-accent">
            <span className="truncate">
                {label}
            </span>
            <button
                type="button"
                aria-label={`Hapus filter ${label}`}
                onClick={onClear}
                className="inline-flex size-5 shrink-0 items-center justify-center rounded-full transition hover:bg-green-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-green-accent/20"
            >
                <X size={13} />
            </button>
        </span>
    )
}

type FilterDropdownProps = {
    activeCount: number
    sortBy: SortOption
    onSortChange: (value: SortOption) => void
    limitMin: string
    limitMax: string
    onLimitMinChange: (value: string) => void
    onLimitMaxChange: (value: string) => void
    limitBounds: { min: number; max: number }
    categoryOptions: string[]
    selectedCategories: string[]
    onSelectedCategoriesChange: (value: string[]) => void
    onReset: () => void
}

export default function FilterDropdown({
    activeCount,
    sortBy,
    onSortChange,
    limitMin,
    limitMax,
    onLimitMinChange,
    onLimitMaxChange,
    limitBounds,
    categoryOptions,
    selectedCategories,
    onSelectedCategoriesChange,
    onReset,
}: FilterDropdownProps) {
    const selectedSet = new Set(selectedCategories)
    const parsedMin = parseCurrencyInput(limitMin)
    const parsedMax = parseCurrencyInput(limitMax)
    const sliderMin = parsedMin ?? limitBounds.min
    const sliderMax = parsedMax ?? limitBounds.max
    const sliderValue: [number, number] =
        sliderMin <= sliderMax
            ? [sliderMin, sliderMax]
            : [sliderMax, sliderMin]
    const sliderStep = 500000

    const toggleCategory = (category: string) => {
        if (selectedSet.has(category)) {
            onSelectedCategoriesChange(
                selectedCategories.filter((item) => item !== category)
            )
            return
        }

        onSelectedCategoriesChange([...selectedCategories, category])
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-between rounded-xl border-green-accent/25 px-3.5 text-green-accent hover:bg-light-green-accent sm:w-fit"
                >
                    <span className="inline-flex items-center gap-2">
                        <ListFilter size={16} />
                        Filter
                    </span>
                    {activeCount > 0 && (
                        <span className="ml-3 rounded-full bg-green-accent px-2 py-0.5 text-xs font-bold text-white">
                            {activeCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                className="w-[min(26rem,calc(100vw-2rem))] border-green-accent/20 p-4"
            >
                <div className="space-y-5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold">
                                Filter UMKM
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Atur urutan, plafon, dan tipe bisnis.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            disabled={activeCount === 0}
                            className="text-green-accent hover:bg-light-green-accent hover:text-green-accent"
                        >
                            Reset
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Urutkan
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {sortOptions.map((option) => {
                                const isSelected = option.value === sortBy

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => onSortChange(option.value)}
                                        className={`flex h-10 items-center justify-between rounded-lg border px-3 text-sm font-semibold transition hover:border-green-accent hover:bg-light-green-accent hover:text-green-accent focus:outline-none focus:ring-2 focus:ring-green-accent/20 ${
                                            isSelected
                                                ? "border-green-accent bg-light-green-accent text-green-accent"
                                                : "border-border"
                                        }`}
                                    >
                                        {option.label}
                                        {isSelected && <Check size={15} />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Range nominal plafon
                        </p>
                        <div className="rounded-xl border border-green-accent/15 bg-light-green-accent/30 px-3 py-4">
                            <Slider
                                min={limitBounds.min}
                                max={limitBounds.max}
                                step={sliderStep}
                                value={sliderValue}
                                onValueChange={(value) => {
                                    const [minValue, maxValue] = value

                                    onLimitMinChange(formatCurrency(minValue))
                                    onLimitMaxChange(formatCurrency(maxValue))
                                }}
                            />
                            <div className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-green-accent">
                                <span>{formatCurrency(limitBounds.min)}</span>
                                <span>{formatCurrency(limitBounds.max)}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                value={limitMin}
                                onChange={(event) =>
                                    onLimitMinChange(
                                        formatCurrencyInput(event.target.value)
                                    )
                                }
                                inputMode="numeric"
                                placeholder="Min plafon"
                                className="rounded-xl"
                            />
                            <Input
                                value={limitMax}
                                onChange={(event) =>
                                    onLimitMaxChange(
                                        formatCurrencyInput(event.target.value)
                                    )
                                }
                                inputMode="numeric"
                                placeholder="Max plafon"
                                className="rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">
                            Tipe bisnis
                        </p>
                        {categoryOptions.length === 0 ? (
                            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                                Belum ada tipe bisnis.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {categoryOptions.map((category) => {
                                    const isSelected = selectedSet.has(category)

                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => toggleCategory(category)}
                                            className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition hover:border-green-accent hover:bg-light-green-accent hover:text-green-accent focus:outline-none focus:ring-2 focus:ring-green-accent/20 ${
                                                isSelected
                                                    ? "border-green-accent bg-light-green-accent text-green-accent"
                                                    : "border-border text-muted-foreground"
                                            }`}
                                        >
                                            {isSelected && <Check size={14} />}
                                            {category.toUpperCase()}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
