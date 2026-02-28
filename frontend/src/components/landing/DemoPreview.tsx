import { demoPreviewMock } from '../../data/mockLanding'

export function DemoPreview() {
  const isPositive = demoPreviewMock.changePercent >= 0

  return (
    <section className="px-6 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          See It In Action
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-slate-600">
          A preview of what your dashboard looks like when AI detects something
          that moves the needle.
        </p>
        <div className="mt-12 flex justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">
                {demoPreviewMock.symbol}
              </span>
              <span
                className={`text-lg font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
              >
                ${demoPreviewMock.price.toFixed(2)} (
                {isPositive ? '+' : ''}
                {demoPreviewMock.changePercent}%)
              </span>
            </div>
            <div className="mt-4 inline-flex rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800">
              {demoPreviewMock.impactBadge}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              {demoPreviewMock.explanation}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
