import { WebsiteComparison } from "@/components/website-comparison"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Voting Website Comparison
          </h1>
          <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-400 px-28">
            Bandingin Website Gweh sama Org Website, mirip gak cok, Oh iya ini Website cuman depannya aja.
          </p>
        </header>

        <WebsiteComparison />
      </div>
    </main>
  )
}
