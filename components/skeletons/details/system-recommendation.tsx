import { Skeleton } from "@/components/ui/skeleton"

export default function SystemRecommendationSkeleton() {
    return (
        <div className="overflow-hidden border-y p-4 lg:p-8 space-y-6">

            {/* title */}
            <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-64" />
            </div>

            <hr />

            {/* recommendations */}
            <div className="space-y-4 sm:px-4 lg:px-8">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2"
                    >
                        <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                        <Skeleton className="h-6 w-72 max-w-full" />

                        {index === 0 && (
                            <Skeleton className="h-8 w-28 rounded-full" />
                        )}
                    </div>
                ))}
            </div>

            <hr />

            {/* badges */}
            <div className="flex flex-wrap gap-3 py-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        className="h-12 w-full rounded-full sm:flex-1"
                    />
                ))}
            </div>

            <hr />

            {/* footer */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    )
}