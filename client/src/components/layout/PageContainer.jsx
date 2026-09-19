export default function PageContainer({
  children = null,
  title,
  description,
  actions,
  className = "",
}) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      className={`min-h-[calc(100vh-4rem)] w-full bg-slate-50 px-4 py-6 text-slate-900 transition-[padding] duration-200 sm:px-6 sm:py-8 lg:px-8 lg:py-10 ${className}`}
    >
      <div className="mx-auto w-full max-w-[1600px]">
        {hasHeader && (
          <header className="mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="min-w-0">
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  {title}
                </h1>
              )}

              {description && (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  {description}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex shrink-0 flex-wrap items-center gap-3">
                {actions}
              </div>
            )}
          </header>
        )}

        <div>{children}</div>
      </div>
    </section>
  );
}
