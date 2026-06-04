import NavLinks from "./nav-links"

export default function Sidebar(){
    return (
        <aside className="hidden lg:flex sticky top-0 h-screen w-72 flex-col border-r bg-background p-6">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-accent text-lg font-bold text-white">
                        RP
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Risk Profiler</h1>
                    </div>
                </div>

                <NavLinks />
            </div>

        </aside>
    )
}
