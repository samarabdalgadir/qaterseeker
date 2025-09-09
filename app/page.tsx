import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Find your next job in Qatar
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Browse curated job listings from trusted employers and apply in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No spam. Apply securely using your Qatar Seeker profile.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-blue-200/50 via-transparent to-purple-200/50 dark:from-blue-900/30 dark:to-purple-900/30 blur-2xl" />
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
                  <span>Powerful filters to find roles by title, location, and salary.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
                  <span>One-click apply for many positions using your saved profile.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2 w-2 rounded-full bg-blue-600" />
                  <span>Track application status right from your dashboard.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
