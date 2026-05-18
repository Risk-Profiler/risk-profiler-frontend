export default function VariableContribution() {
    return (
        <div className="space-y-6 overflow-hidden">
            <h1 className="text-lg sm:text-xl font-bold">
                Kontribusi Variabel
            </h1>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_auto] sm:gap-4">

                {/* stabilitas */}
                <p className="break-words text-sm sm:text-base text-muted-foreground">
                    Stabilitas
                </p>
                <div className="h-4 sm:h-5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[90%] rounded-full bg-green-accent" />
                </div>
                <p className="text-sm sm:text-base font-medium text-green-accent">
                    +40
                </p>

                {/* kedisiplinan */}
                <p className="break-words text-sm sm:text-base text-muted-foreground">
                    Kedisiplinan
                </p>
                <div className="h-4 sm:h-5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[50%] rounded-full bg-green-accent" />
                </div>
                <p className="text-sm sm:text-base font-medium text-green-accent">
                    +40
                </p>
          

                {/* kredibilitas */}
                <p className="break-words text-sm sm:text-base text-muted-foreground">
                    Kredibilitas
                </p>
                <div className="h-4 sm:h-5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[60%] rounded-full bg-green-accent" />
                </div>
                <p className="text-sm sm:text-base font-medium text-green-accent">
                    +40
                </p>
          

                {/* indeks */}
                <p className="break-words text-sm sm:text-base text-muted-foreground">
                    Indeks
                </p>
                <div className="h-4 sm:h-5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[55%] rounded-full bg-green-accent" />
                </div>
                <p className="text-sm sm:text-base font-medium text-green-accent">
                    +40
                </p>
          

                {/* mobilitas perasional */}
                <p className="break-words text-sm sm:text-base text-muted-foreground">
                    Mobilitas Operasional
                </p>
                <div className="h-4 sm:h-5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[25%] rounded-full bg-green-accent" />
                </div>
                <p className="text-sm sm:text-base font-medium text-green-accent">
                    +40
                </p>
              
            </div>
        </div>
    )
}