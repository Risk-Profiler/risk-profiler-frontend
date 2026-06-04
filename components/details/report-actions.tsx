import { DownloadIcon, GitCompareArrows } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type ReportActionsProps = {
    onDownload: () => void
    onCompare: () => void
}

export default function ReportActions({
    onDownload,
    onCompare,
}: ReportActionsProps) {
    const actions = [
        {
            label: "Unduh Laporan PDF",
            icon: DownloadIcon,
            onClick: onDownload,
        },
        {
            label: "Bandingkan Debitur Serupa",
            icon: GitCompareArrows,
            onClick: onCompare,
        },
    ]

    return (
        <div>
            <div className="hidden md:grid grid-cols-2 text-sm font-semibold">
                {actions.map((action, index) => {
                    const Icon = action.icon

                    return (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className={`flex justify-center items-center py-6 gap-2 text-muted-foreground hover:bg-muted transition cursor-pointer ${
                                index === 0 ? "border-r" : ""
                            }`}
                        >
                            <Icon size={20} />
                            <span className="underline">{action.label}</span>
                        </button>
                    )
                })}
            </div>

            <Carousel className="relative block md:hidden text-sm font-semibold border-t">
                <CarouselContent>
                    {actions.map((action) => {
                        const Icon = action.icon

                        return (
                            <CarouselItem key={action.label}>
                                <button
                                    onClick={action.onClick}
                                    className="flex w-full justify-center items-center py-6 gap-2 text-muted-foreground hover:bg-muted transition cursor-pointer"
                                >
                                    <Icon size={20} />
                                    <span className="underline">{action.label}</span>
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
