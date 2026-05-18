import { sidebarOptions } from "@/lib/menus";
import { ArrowRight } from "lucide-react"

type NavbarMenuProps = {
    openNavbarMenu: boolean;
    setOpenNavbarMenu: (open: boolean) => void;
}

export default function NavbarMenu({ openNavbarMenu, setOpenNavbarMenu } : NavbarMenuProps){
    return (
       <div 
            onClick={() => setOpenNavbarMenu(false)}
            className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
                openNavbarMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                className={`fixed top-0 right-0 z-50 h-screen w-72 bg-white p-4 space-y-4
                transition-transform duration-300 ${
                    openNavbarMenu ? "translate-x-0" : "translate-x-full"
                }`} 
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Risk Profiler</h1>
                        <p className="text-sm text-muted-foreground">Credit Scoring</p>
                    </div>

                    <div>
                        <ArrowRight onClick={() => setOpenNavbarMenu(false)} className="cursor-pointer"/>
                    </div>
                </div>
                
                <hr />

                <div className="text-sm text-muted-foreground flex flex-col gap-2">
                    {sidebarOptions.map((options) => (
                        <a 
                            key={options.id} 
                            href={options.link} className="px-4 py-2 rounded-lg hover:bg-green-accent hover:text-white transition"
                        >
                           {options.name}
                        </a>
                    ))}
                </div>
                
            </div>
        </div>
        
    )
}