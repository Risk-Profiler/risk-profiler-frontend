import { Skeleton } from "@/components/ui/skeleton"

export default function DataSourcesSkeleton() {
    return (
        <div className="space-y-4 overflow-hidden">

            {/* title */}
            <Skeleton className="h-7 w-40" />

            {/* badges */}
            <div className="flex flex-wrap gap-2">

                {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                        key={index}
                        className="h-10 w-44 rounded-full"
                    />
                ))}

            </div>
        </div>
    )
}