import { Skeleton } from "@/components/ui/skeleton"

export default function DetailsHeaderSkeleton() {
    return (
        <header className="overflow-hidden border-b p-4 lg:p-8 space-y-4">

            {/* breadcrumbs */}
            <Skeleton className="h-4 w-24" />

            {/* title n limit */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                {/* title */}
                <div className="min-w-0 space-y-3">
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-40" />
                </div>

                {/* desktop plafon */}
                <div className="hidden shrink-0 space-y-3 text-right lg:block">
                    <Skeleton className="ml-auto h-4 w-36" />
                    <Skeleton className="ml-auto h-10 w-52" />
                </div>
            </div>

            {/* mobile plafon card */}
            <div className="block rounded-xl border p-4 space-y-4 lg:hidden">
                <div className="space-y-3">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-8 w-48" />
                </div>

                <hr />

                <div className="space-y-3">
                    <Skeleton className="h-8 w-44 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>

            {/* desktop status */}
            <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
                <Skeleton className="h-10 w-56 rounded-full" />
                <Skeleton className="h-4 w-80" />
            </div>
        </header>
    )
}