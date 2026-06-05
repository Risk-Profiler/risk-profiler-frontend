import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
    return (
        <div className="mt-6 overflow-hidden rounded-2xl border bg-background">
            <div className="hidden grid-cols-[76px_minmax(260px,1.7fr)_minmax(180px,.85fr)_minmax(190px,1fr)_44px] items-center gap-4 border-b bg-muted/25 px-5 py-3 lg:grid">
                {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} className="h-3 w-16" />
                ))}
            </div>

            <div className="divide-y">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[1fr_auto] md:items-start lg:grid-cols-[76px_minmax(260px,1.7fr)_minmax(180px,.85fr)_minmax(190px,1fr)_44px] lg:items-center"
                    >
                        <div className="space-y-2 md:col-span-2 lg:col-span-1">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-3 w-10" />
                        </div>
                        <div className="space-y-2 md:col-start-1 lg:col-start-auto">
                            <Skeleton className="h-5 w-44 max-w-full" />
                            <Skeleton className="h-3 w-64 max-w-full" />
                        </div>
                        <div className="flex flex-wrap gap-2 md:col-start-1 lg:col-start-auto">
                            <Skeleton className="h-7 w-28 rounded-full" />
                            <Skeleton className="h-7 w-24 rounded-full" />
                        </div>
                        <div className="space-y-2 md:col-start-1 lg:col-start-auto">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex gap-2 md:col-start-2 md:row-start-2 md:justify-end lg:col-start-auto lg:row-start-auto">
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
