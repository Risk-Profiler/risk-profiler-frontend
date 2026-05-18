"use client"

import { Menu } from "lucide-react"
import { useState } from "react";
import NavbarMenu from "./navbar-menu";

export default function Navbar(){
    const [openNavMenu, setOpenNavMenu] = useState(false);

    return (
        <>
            <nav className="flex justify-between items-center lg:hidden bg-white p-4 border-b sticky top-0 z-50">
                <div>
                    <h1 className="text-xl font-bold">Risk Profiler</h1>
                    <p className="text-sm text-muted-foreground">Credit Scoring</p>
                </div>

                <Menu 
                    className="hover:rotate-90 transition cursor-pointer" 
                    onClick={() => setOpenNavMenu(true)} 
                />
            </nav>

            <NavbarMenu 
                openNavbarMenu={openNavMenu}
                setOpenNavbarMenu={setOpenNavMenu} 
            />
        </>
    )
}