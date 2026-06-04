"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import Navbar from "./navbar"
import Sidebar from "./sidebar"

export default function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const isLanding = pathname === "/"

    if (isLanding) {
        return <>{children}</>
    }

    return (
        <div className="grid min-h-full grid-cols-1 pt-20 lg:grid-cols-[auto_1fr] lg:pt-0">
            <Navbar />
            <Sidebar />
            {children}
        </div>
    )
}
