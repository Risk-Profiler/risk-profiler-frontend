"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    FilePlus2,
    Home,
    LayoutDashboard,
    type LucideIcon,
} from "lucide-react"

import { sidebarOptions } from "@/lib/menus"
import { cn } from "@/lib/utils"

const icons: Record<string, LucideIcon> = {
    "layout-dashboard": LayoutDashboard,
    "file-plus": FilePlus2,
    home: Home,
}

type NavLinksProps = {
    onNavigate?: () => void
}

export default function NavLinks({ onNavigate }: NavLinksProps) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col gap-2">
            {sidebarOptions.map((option) => {
                const Icon = icons[option.icon] ?? Home
                const active =
                    option.link === "/"
                        ? pathname === option.link
                        : pathname.startsWith(option.link)

                return (
                    <Link
                        key={option.id}
                        href={option.link}
                        onClick={onNavigate}
                        className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition",
                            active
                                ? "bg-green-accent text-white"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <span
                            className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition",
                                active
                                    ? "bg-white/15 text-white"
                                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                            )}
                        >
                            <Icon size={18} />
                        </span>

                        <span className="min-w-0 font-medium">
                            {option.name}
                        </span>
                    </Link>
                )
            })}
        </div>
    )
}
