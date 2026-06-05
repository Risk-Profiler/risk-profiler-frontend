import { DownloadIcon, GitCompareArrows, Loader2 } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type ReportActionsProps = {
    pendingAction?: "download" | "compare" | null
    onDownload: () => void
    onCompare: () => void
}

export default function ReportActions({
    pendingAction = null,
    onDownload,
    onCompare,
}: ReportActionsProps) {
    const actions = [
        {
            id: "download",
            label: "Unduh Laporan PDF",
            loadingLabel: "Membuat laporan",
            icon: DownloadIcon,
            onClick: onDownload,
        },
        {
            id: "compare",
            label: "Bandingkan Debitur Serupa",
            loadingLabel: "Mencari pembanding",
            icon: GitCompareArrows,
            onClick: onCompare,
        },
    ]

    return (
        <div>
            <div className="hidden md:grid grid-cols-2 text-sm font-semibold">
                {actions.map((action, index) => {
                    const Icon = action.icon
                    const isPending = pendingAction === action.id

                    return (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            disabled={Boolean(pendingAction)}
                            className={`flex justify-center items-center py-6 gap-2 text-muted-foreground hover:bg-muted transition cursor-pointer disabled:cursor-wait disabled:opacity-70 ${
                                index === 0 ? "border-r" : ""
                            }`}
                        >
                            {isPending ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Icon size={20} />
                            )}
                            <span className="underline">
                                {isPending ? action.loadingLabel : action.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            <Carousel className="relative block md:hidden text-sm font-semibold border-t">
                <CarouselContent>
                    {actions.map((action) => {
                        const Icon = action.icon
                        const isPending = pendingAction === action.id

                        return (
                            <CarouselItem key={action.label}>
                                <button
                                    onClick={action.onClick}
                                    disabled={Boolean(pendingAction)}
                                    className="flex w-full justify-center items-center py-6 gap-2 text-muted-foreground hover:bg-muted transition cursor-pointer disabled:cursor-wait disabled:opacity-70"
                                >
                                    {isPending ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Icon size={20} />
                                    )}
                                    <span className="underline">
                                        {isPending ? action.loadingLabel : action.label}
                                    </span>
                                </button>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 bg-black text-white" />
                <CarouselNext className="absolute right-4 bg-black text-white" />
            </Carousel>
        </div>
    )
}
