import DataSourcesSkeleton from "../skeletons/details/data-sources"
import { Check, XIcon } from "lucide-react"
import type { DataSourceItem } from "@/lib/risk-profile"

type DataSourcesProps = {
    dataSources: DataSourceItem[]
    loading?: boolean
}

export default function DataSources({
    dataSources,
    loading = false,
}: DataSourcesProps) {
    if (loading) {
        return <DataSourcesSkeleton />
    }

    return (
        <div className="space-y-4 overflow-hidden">
            <h1 className="text-lg sm:text-xl font-bold">
                Sumber Data
            </h1>

            <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-semibold">
                {dataSources.map((source) => (
                    <div
                        key={source.id}
                        className={`flex w-fit max-w-full items-center gap-2 rounded-full px-3 sm:px-4 py-2 ${
                            source.available
                                ? "bg-light-green-accent text-green-accent"
                                : "bg-light-red-accent text-red-accent"
                        }`}
                    >
                        {source.available ? (
                            <Check size={14} className="shrink-0 sm:size-4" />
                        ) : (
                            <XIcon size={14} className="shrink-0 sm:size-4" />
                        )}

                        <p className="break-words">
                            {source.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
