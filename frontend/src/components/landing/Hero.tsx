export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 px-6 pt-20 pb-28 lg:pt-28 lg:pb-36">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)]" />
      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Understand What Moves Your Stocks.
        </h1>
        <p className="mt-6 text-lg text-slate-600 sm:text-xl">
          AI monitors your stocks and explains what actually impacts price
          movement — news, trades, and hidden vectors — in simple language.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            className="w-full rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 sm:w-auto"
          >
            Start Monitoring
          </button>
          <button
            type="button"
            className="w-full rounded-xl border border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            View Demo
          </button>
        </div>
      </div>
    </section>
  )
}
