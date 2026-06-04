import { ArrowRight } from "lucide-react"
import NavLinks from "./nav-links";

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
                className={`fixed top-0 right-0 z-50 h-screen w-80 max-w-[86vw] bg-background p-4 space-y-4 shadow-2xl
                transition-transform duration-300 ${
                    openNavbarMenu ? "translate-x-0" : "translate-x-full"
                }`} 
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Risk Profiler</h1>
                    </div>

                    <div>
                        <ArrowRight onClick={() => setOpenNavbarMenu(false)} className="cursor-pointer"/>
                    </div>
                </div>
                
                <hr />

                <NavLinks onNavigate={() => setOpenNavbarMenu(false)} />
                
            </div>
        </div>
        
    )
}
