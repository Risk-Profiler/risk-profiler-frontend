import { XIcon, ChevronRight, Check } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type DecisionActionsProps = {
    onReject: () => void
    onRevise: () => void
    onApprove: () => void
}

export default function DecisionActions({
    onReject,
    onRevise,
    onApprove,
}: DecisionActionsProps) {
    const actions = [
        {
            label: "Rekomendasikan Penolakan",
            icon: XIcon,
            onClick: onReject,
            className: "bg-light-red-accent text-red-accent",
        },
        {
            label: "Ajukan Revisi Plafon",
            icon: ChevronRight,
            onClick: onRevise,
            className: "bg-light-yellowish-accent text-yellowish-accent",
        },
        {
            label: "Rekomendasikan Approval",
            icon: Check,
            onClick: onApprove,
            className: "bg-light-green-accent text-green-accent",
        },
    ]

    return (
        <div className="sticky bottom-0 bg-background">
            <div className="hidden lg:grid grid-cols-3 text-sm font-semibold border-t">
                {actions.map((action, index) => {
                    const Icon = action.icon

                    return (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className={`flex justify-center items-center py-6 gap-2 hover:brightness-95 transition cursor-pointer ${action.className} ${
                                index === 1 ? "border-x" : ""
                            }`}
                        >
                            <Icon size={20} />
                            <span className="underline">{action.label}</span>
                        </button>
                    )
                })}
            </div>

            <Carousel className="relative block lg:hidden text-sm font-semibold border-t">
                <CarouselContent>
                    {actions.map((action) => {
                        const Icon = action.icon

                        return (
                            <CarouselItem key={action.label}>
                                <button
                                    onClick={action.onClick}
                                    className={`flex w-full justify-center items-center py-6 gap-2 hover:brightness-95 transition cursor-pointer ${action.className}`}
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
