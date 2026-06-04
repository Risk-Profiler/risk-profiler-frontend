"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground">
          <Sparkles size={16} className="text-green-accent" />
          Alternative credit scoring untuk UMKM
        </div>

        <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Risk Profiler
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Analisis risiko pembiayaan UMKM dari data operasional, skor model,
          faktor keputusan, dan rekomendasi plafon dalam satu workflow review.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.35 }}
          className="mt-8"
        >
          <Link
            href="/data_input"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-accent px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95"
          >
            Mulai Analisis
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </motion.section>
    </main>
  )
}
