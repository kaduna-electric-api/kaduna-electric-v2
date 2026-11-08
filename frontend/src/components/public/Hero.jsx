import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative isolate min-h-[calc(100svh-4rem)] overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_38%,rgba(14,165,233,0.22),transparent_38%),radial-gradient(ellipse_at_8%_90%,rgba(245,158,11,0.15),transparent_32%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      <motion.div
        aria-hidden="true"
        className="absolute -right-36 top-8 -z-10 h-[34rem] w-[34rem] rounded-full border border-cyan-200/10"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 80, ease: 'linear', repeat: Infinity }}
      >
        <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_30px_8px_rgba(34,211,238,0.6)]" />
      </motion.div>

      <div className="section-padding mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-200 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            King&apos;s Power <span className="text-white/40">/</span> Prepaid power
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl xl:text-8xl">
            POWER UP
            <span className="mt-2 block bg-gradient-to-r from-cyan-200 via-white to-amber-200 bg-clip-text text-transparent">
              YOUR EVERYDAY.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            A bold, effortless way to manage prepaid power accounts, meters, purchases, and transaction history.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-3 rounded-xl bg-amber-300 px-6 py-3.5 font-bold text-slate-950 shadow-[0_12px_40px_rgba(245,158,11,0.18)] transition duration-300 hover:-translate-y-1 hover:bg-amber-200 hover:shadow-[0_16px_50px_rgba(245,158,11,0.28)]"
            >
              Enter the experience
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 font-semibold text-white backdrop-blur transition hover:border-cyan-200/50 hover:bg-white/[0.08]"
            >
              Explore the flow
              <ArrowDown className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-400">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Secure account access</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>₦100–₦10,000 per purchase</span>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-xl"
        >
          <motion.div
            aria-hidden="true"
            className="absolute -inset-8 rounded-[3rem] bg-cyan-400/10 blur-3xl"
            animate={reduceMotion ? undefined : { opacity: [0.35, 0.75, 0.35], scale: [0.96, 1.04, 0.96] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/80 p-5 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-8"
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">Power control</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Your energy, in focus.</h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                Account preview
              </div>
            </div>

            <div className="relative mt-8 rounded-2xl border border-white/10 bg-slate-950/75 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20">
                    <Zap className="h-5 w-5" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-semibold">Prepaid meter</p>
                    <p className="text-xs text-slate-400">Sample account •••• 2841</p>
                  </div>
                </div>
                <span className="rounded-lg bg-white/[0.06] px-2.5 py-1.5 text-xs font-semibold text-slate-300">READY</span>
              </div>

              <div className="mt-7 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Purchase limit</p>
                  <p className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">₦10,000</p>
                </div>
                <div className="flex h-14 items-end gap-1.5 pb-1" aria-hidden="true">
                  {[24, 38, 29, 48, 34, 58, 42, 52, 33, 46, 60, 39].map((height, index) => (
                    <motion.span
                      key={index}
                      className="w-1.5 rounded-full bg-gradient-to-t from-blue-500 to-cyan-200"
                      initial={{ height: height * 0.55 }}
                      animate={reduceMotion ? undefined : { height: [height * 0.55, height, height * 0.7] }}
                      transition={{ duration: 1.8 + (index % 4) * 0.25, repeat: Infinity, repeatType: 'reverse', delay: index * 0.04 }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-300 to-amber-200"
                  initial={{ width: reduceMotion ? '72%' : '0%' }}
                  animate={{ width: '72%' }}
                  transition={{ duration: 1.2, delay: 0.55, ease: 'easeOut' }}
                />
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-500">
                <span>Explore the flow</span>
                <span>Sample experience</span>
              </div>
            </div>

            <div className="relative mt-4 flex items-center gap-3 rounded-xl border border-amber-200/15 bg-amber-200/[0.06] p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-200/10 text-amber-200">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-xs leading-5 text-slate-300">
                Simulated payments and sample tokens only. Nothing here recharges a real meter.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
