import type { ReactNode } from "react"

type FormSectionProps = {
    icon: ReactNode
    title: string
    children: ReactNode
}

export default function FormSection({
    icon,
    title,
    children,
}: FormSectionProps) {
    return (
        <section className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[220px_1fr] lg:gap-8">
            <div className="flex items-center gap-3 lg:items-start">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-light-green-accent text-green-accent">
                    {icon}
                </div>
                <h3 className="text-base font-semibold">
                    {title}
                </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {children}
            </div>
        </section>
    )
}
