import { Skeleton } from "@/components/ui/skeleton"

export default function VariableContributionSkeleton() {
    return (
        <div className="space-y-6 overflow-hidden">

            {/* title */}
            <Skeleton className="h-7 w-52" />

            {/* variables */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr_auto]">

                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="contents"
                    >
                        <Skeleton className="h-5 w-32" />

                        <Skeleton className="h-4 sm:h-5 w-full rounded-full" />

                        <Skeleton className="h-5 w-10" />
                    </div>
                ))}

            </div>
        </div>
    )
}