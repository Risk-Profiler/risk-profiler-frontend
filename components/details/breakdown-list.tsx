import BreakdownListSkeleton from "../skeletons/details/breakdown-list"
import { gaugeCategories } from "@/lib/gauges"

type BreakdownListProps = {
    loading?: boolean
}

export default function BreakdownList({ loading } : BreakdownListProps) {
    if (loading) {
        return <BreakdownListSkeleton/>
    }

    return (
        <div className="space-y-4">
            <h1 className="text-lg sm:text-xl font-bold">
                Breakdown Kontribusi
            </h1>

            <div className="space-y-3">
                {gaugeCategories.map((category) => (
                    <div
                        key={category.id}
                        className="flex items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-6 py-3"
                    >
                        <div
                            className={`${category.color} h-3 w-3 shrink-0 rounded-full`}
                        />

                        <div className="min-w-0">
                            <h1 className="break-words text-sm sm:text-base font-semibold">
                                {category.range}
                            </h1>

                            <p className="break-words text-xs sm:text-sm text-muted-foreground">
                                {category.category}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}