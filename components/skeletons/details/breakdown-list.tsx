import { Skeleton } from "@/components/ui/skeleton"

export default function BreakdownListSkeleton() {
    return (
        <div className="space-y-4">

            {/* title */}
            <Skeleton className="h-7 w-56" />

            {/* breakdown cards */}
            <div className="space-y-3">

                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-6 py-3"
                    >
                        {/* dot */}
                        <Skeleton className="h-3 w-3 shrink-0 rounded-full" />

                        {/* text */}
                        <div className="min-w-0 space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}