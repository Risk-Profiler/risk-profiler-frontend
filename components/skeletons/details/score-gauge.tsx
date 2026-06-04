import { Skeleton } from "@/components/ui/skeleton"

export default function ScoreGaugeSkeleton() {
    return (
        <div className="overflow-hidden space-y-6">

            {/* gauge bar */}
            <div className="relative">
                <Skeleton className="h-6 w-full rounded-full sm:h-8" />

                {/* marker */}
                <div className="absolute left-1/2 top-6 -translate-x-1/2 sm:top-8 flex flex-col items-center gap-2">
                    <Skeleton className="h-6 w-[2px]" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-4 w-10" />
                </div>
            </div>

            {/* categories */}
            <div className="mt-16 grid grid-cols-1 gap-3 sm:mt-18 sm:grid-cols-2 sm:gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2"
                    >
                        <Skeleton className="h-2 w-2 rounded-full shrink-0" />

                        <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ))}
            </div>

            {/* footer */}
            <Skeleton className="h-4 w-56" />
        </div>
    )
}