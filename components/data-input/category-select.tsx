"use client"

import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { categories, categoryLabels } from "@/lib/data-input"

type CategorySelectProps = {
    value?: string
    onChange: (value: string) => void
}

export default function CategorySelect({
    value,
    onChange,
}: CategorySelectProps) {
    const selectedLabel = value ? categoryLabels[value] : "Pilih kategori"

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-between rounded-lg border-input bg-background px-3.5 text-sm font-medium hover:border-green-accent hover:bg-light-green-accent/50 aria-expanded:border-green-accent aria-expanded:bg-light-green-accent/60"
                >
                    <span className={value ? "text-foreground" : "text-muted-foreground"}>
                        {selectedLabel}
                    </span>
                    <ChevronDown
                        size={16}
                        className="ml-2 shrink-0 text-green-accent"
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="start"
                className="w-[min(18rem,calc(100vw-2rem))] p-2"
            >
                <div className="grid gap-1">
                    {categories.map((category) => {
                        const isSelected = value === category

                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => onChange(category)}
                                className="flex h-10 items-center justify-between rounded-lg px-3 text-sm font-medium transition hover:bg-light-green-accent hover:text-green-accent focus:bg-light-green-accent focus:text-green-accent focus:outline-none"
                            >
                                {categoryLabels[category]}
                                {isSelected && (
                                    <Check
                                        size={16}
                                        className="text-green-accent"
                                    />
                                )}
                            </button>
                        )
                    })}
                </div>
            </PopoverContent>
        </Popover>
    )
}
