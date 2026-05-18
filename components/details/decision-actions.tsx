import { XIcon, ChevronRight, Check } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function DecisionActions(){
    return (
        <div className="sticky bottom-0">
            <div className="hidden lg:grid grid-cols-3 text-sm font-semibold border-t">
                <div className="flex justify-center items-center py-6 gap-2 bg-light-red-accent text-red-accent hover:brightness-95 transition cursor-pointer">
                    <XIcon size={20}/>
                    <h1 className="underline">Rekomendasikan Penolakan</h1>
                </div>
                <div className="flex justify-center items-center py-6 gap-2 border-x bg-light-yellowish-accent text-yellowish-accent hover:brightness-95 transition cursor-pointer">
                    <ChevronRight size={20}/>
                    <h1 className="underline">Ajukan Revisi Plafon</h1>
                </div>
                <div className="flex justify-center items-center py-6 gap-2 bg-light-green-accent text-green-accent hover:brightness-95 transition cursor-pointer">
                    <Check size={20}/>
                    <h1 className="underline">Rekomendasikan Approval</h1>
                </div>
            </div>
            

            <Carousel className="relative block lg:hidden text-sm font-semibold border-t">
                <CarouselContent>
                    <CarouselItem className="flex justify-center items-center py-6 gap-2 bg-light-red-accent text-red-accent hover:brightness-95 transition cursor-pointer">
                        <XIcon size={20}/>
                        <h1 className="underline">Rekomendasikan Penolakan</h1>
                    </CarouselItem>
                    <CarouselItem className="flex justify-center items-center py-6 gap-2 border-x bg-light-yellowish-accent text-yellowish-accent hover:brightness-95 transition cursor-pointer">
                        <ChevronRight size={20}/>
                        <h1 className="underline">Ajukan Revisi Plafon</h1>
                    </CarouselItem>
                    <CarouselItem className="flex justify-center items-center py-6 gap-2 bg-light-green-accent text-green-accent hover:brightness-95 transition cursor-pointer">
                        <Check size={20}/>
                        <h1 className="underline">Rekomendasikan Approval</h1>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 bg-black text-white"/>
                <CarouselNext className="absolute right-4 bg-black text-white" />
            </Carousel>
        </div>
    )
}