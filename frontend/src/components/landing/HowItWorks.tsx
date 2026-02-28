const steps = [
  {
    title: 'Add Stocks to Watch',
    description: 'Select stocks you care about.',
    icon: (
      <svg
        className="h-8 w-8 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    ),
  },
  {
    title: 'AI Surveillance',
    description:
      'We track news, unusual trades, and key impact vectors.',
    icon: (
      <svg
        className="h-8 w-8 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    ),
  },
  {
    title: 'Impact Alerts',
    description: 'Get notified when something important happens.',
    icon: (
      <svg
        className="h-8 w-8 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
    ),
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-6 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          How It Works
        </h2>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-surface p-8 shadow-sm transition hover:shadow-md hover:border-border-hover"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted">
                {step.icon}
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
