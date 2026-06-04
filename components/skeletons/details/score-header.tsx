import { Skeleton } from "@/components/ui/skeleton"

export default function ScoreHeaderSkeleton(){
    return (
        <div className="flex flex-col gap-3 items-center">

            {/* score */}
            <Skeleton className="h-16 w-40" />

            {/* risk badge */}
            <Skeleton className="h-10 w-40 rounded-full" />

            {/* description */}
            <Skeleton className="h-4 w-56" />

        </div>
    )
}