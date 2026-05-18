import { sidebarOptions } from "@/lib/menus"

export default function Sidebar(){
    return (
        <div className="hidden lg:block sticky top-0 h-screen p-8 w-64 space-y-4 border-r">
            {/* title */}
            <div>
                <h1 className="text-2xl font-bold">Risk Profiler</h1>
                <p className="text-md text-muted-foreground">Credit Scoring</p>
            </div>
            {/* contents */}
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
    )
}