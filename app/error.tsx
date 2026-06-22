'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const reloadPage = async () => {
    try {
      reset()
      if ('caches' in window) {
        const cacheNames = await window.caches.keys()
        await Promise.all(cacheNames.map((name) => window.caches.delete(name)))
      }
    } finally {
      const url = new URL(window.location.href)
      url.searchParams.set('reload', Date.now().toString())
      window.location.replace(url.toString())
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-text-primary">
      <section className="max-w-md text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">Runtime Error</p>
        <h1 className="mb-5 font-display text-5xl italic tracking-tight md:text-6xl">页面加载失败</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted">
          可能是线上版本刚更新，浏览器还缓存了旧的脚本资源。请刷新页面，或点击下方按钮强制重新加载。
        </p>
        <button
          type="button"
          onClick={reloadPage}
          className="rounded-full bg-text-primary px-7 py-3 text-sm font-medium text-bg transition-transform hover:scale-105"
        >
          强制重新加载
        </button>
        {error.digest && <p className="mt-6 text-xs text-muted">Error ID: {error.digest}</p>}
      </section>
    </main>
  )
}
