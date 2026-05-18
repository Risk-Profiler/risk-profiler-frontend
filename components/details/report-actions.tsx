import { DownloadIcon, GitCompareArrows } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function ReportActions(){
    return (
        <div>
            <div className="hidden md:grid grid-cols-2 text-sm font-semibold">
                <div className="flex justify-center items-center py-6 gap-2 border-r text-muted-foreground hover:bg-muted transition cursor-pointer">
                    <DownloadIcon size={20}/>
                    <h1 className="underline">Unduh Laporan PDF</h1>
                </div>
                <div className="flex justify-center items-center py-6 gap-2 text-muted-foreground hover:bg-muted transition cursor-pointer">
                    <GitCompareArrows size={20}/>
                    <h1 className="underline">Bandingkan Debitur Serupa</h1>
                </div>
            </div>

            <Carousel className="relative block md:hidden text-sm font-semibold border-t">
                <CarouselContent>
                    <CarouselItem className="flex justify-center items-center py-6 gap-2 border-r text-muted-foreground hover:bg-muted transition cursor-pointer">
                        <DownloadIcon size={20}/>
                        <h1 className="underline">Unduh Laporan PDF</h1>
                    </CarouselItem>
                    <CarouselItem className="flex justify-center items-center py-6 gap-2 text-muted-foreground hover:bg-muted transition cursor-pointer">
                        <GitCompareArrows size={20}/>
                        <h1 className="underline">Bandingkan Debitur Serupa</h1>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 bg-black text-white"/>
                <CarouselNext className="absolute right-4 bg-black text-white" />
            </Carousel> 
        </div>
    )
}