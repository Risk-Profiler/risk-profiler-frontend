import type { ReactNode } from "react"

type InputWithUnitProps = {
    unit: string
    children: ReactNode
}

export default function InputWithUnit({
    unit,
    children,
}: InputWithUnitProps) {
    return (
        <div className="relative">
            {children}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md bg-light-green-accent px-1.5 py-0.5 text-xs font-semibold text-green-accent">
                {unit}
            </span>
        </div>
    )
}
