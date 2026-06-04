"use client"

import { Menu } from "lucide-react"
import { useState } from "react";
import NavbarMenu from "./navbar-menu";

export default function Navbar(){
    const [openNavMenu, setOpenNavMenu] = useState(false);

    return (
        <>
            <nav className="flex justify-between items-center lg:hidden bg-background/95 p-4 border-b fixed top-0 z-50 w-full backdrop-blur">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-accent text-sm font-bold text-white">
                        RP
                    </div>
                    <div>
                        <h1 className="text-lg font-bold">Risk Profiler</h1>
                    </div>
                </div>

                <button
                    type="button"
                    aria-label="Open navigation"
                    onClick={() => setOpenNavMenu(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border transition hover:bg-muted"
                >
                    <Menu size={20} />
                </button>
            </nav>

            <NavbarMenu 
                openNavbarMenu={openNavMenu}
                setOpenNavbarMenu={setOpenNavMenu} 
            />
        </>
    )
}
