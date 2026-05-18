import { Check, XIcon } from "lucide-react"

export default function DataSources() {
    return (
        <div className="space-y-4 overflow-hidden">
            <h1 className="text-lg sm:text-xl font-bold">
                Sumber Data
            </h1>

            <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-semibold">
                <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-light-green-accent px-3 sm:px-4 py-2 text-green-accent">
                    <Check size={14} className="shrink-0 sm:size-4" />
                    <p className="break-words">
                        QRIS · Jan - Mar 2026
                    </p>
                </div>

                <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-light-green-accent px-3 sm:px-4 py-2 text-green-accent">
                    <Check size={14} className="shrink-0 sm:size-4" />
                    <p className="break-words">
                        Utilitas · Des 2024–Mar 2025
                    </p>
                </div>

                <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-light-green-accent px-3 sm:px-4 py-2 text-green-accent">
                    <Check size={14} className="shrink-0 sm:size-4" />
                    <p className="break-words">
                        E-Commerce · Feb–Mar 2025
                    </p>
                </div>

                <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-light-green-accent px-3 sm:px-4 py-2 text-green-accent">
                    <Check size={14} className="shrink-0 sm:size-4" />
                    <p className="break-words">
                        Seasonal Index · 2024
                    </p>
                </div>

                <div className="flex w-fit max-w-full items-center gap-2 rounded-full bg-light-red-accent px-3 sm:px-4 py-2 text-red-accent">
                    <XIcon size={14} className="shrink-0 sm:size-4" />
                    <p className="break-words">
                        Logistik
                    </p>
                </div>
            </div>
        </div>
    )
}