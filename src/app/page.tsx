import { redirect } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Users,
  Bell,
  CalendarDays,
  Sparkles,
  Link2,
  ArrowRight,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const user = await getSession();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950/80 to-slate-950">
      {/* Global glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="absolute top-[40%] -right-32 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute top-[70%] -left-32 w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-[100px]" />
      </div>

      <div className="relative">
        {/* Nav */}
        <nav className="flex items-center justify-between px-4 py-4 container mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Birthly" className="h-[168px] w-auto" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Link href="/login">Log In</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-white text-slate-900 hover:bg-white/90"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-20 pb-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/10 backdrop-blur-sm px-3 py-1 text-sm text-blue-300">
                <Sparkles className="h-3 w-3" />
                Free &amp; simple to use
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Never forget a{" "}
                <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                  birthday
                </span>{" "}
                again
              </h1>

              <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
                Create groups, invite friends, and get SMS reminders before
                every birthday. No more last-minute scrambles.
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-slate-900 hover:bg-white/90"
                >
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/15 text-white hover:bg-white/10 bg-white/5"
                >
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            </div>

            {/* App mockup with enhanced glow */}
            <div className="mt-16 max-w-2xl mx-auto relative">
              {/* Glow behind mockup */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-blue-500/20 rounded-2xl blur-xl" />
              <div className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-1 shadow-2xl shadow-blue-500/10">
                <div className="rounded-lg bg-slate-900/90 p-6 space-y-4">
                  {/* Mock header */}
                  <div>
                    <div className="text-white font-semibold text-lg">Dashboard</div>
                    <div className="text-slate-500 text-sm">Manage your birthday reminder groups</div>
                  </div>

                  {/* Mock upcoming birthdays */}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <span className="text-base">🎉</span> Upcoming Birthdays
                    </div>
                    <div className="space-y-2.5">
                      {[
                        { name: "Sarah", date: "Mar 15", badge: "Tomorrow", highlight: true },
                        { name: "Mike", date: "Mar 20", badge: "In 6 days", highlight: false },
                      ].map((person) => (
                        <div key={person.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-300">
                              {person.name[0]}
                            </div>
                            <span className="text-white text-sm">{person.name}</span>
                            <span className="text-slate-500 text-xs">{person.date}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            person.highlight
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-white/10 text-slate-400"
                          }`}>
                            {person.badge}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock group cards */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "Best Friends", count: 5, next: "Sarah — tomorrow" },
                      { name: "Family", count: 3, next: "Dad — in 12 days" },
                    ].map((group) => (
                      <div key={group.name} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {group.name}
                        </div>
                        <div className="text-slate-500 text-xs mt-1">{group.count} members</div>
                        <div className="text-slate-400 text-xs mt-0.5">Next: {group.next}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white tracking-tight">How It Works</h2>
              <p className="text-slate-400 mt-2 max-w-lg mx-auto">
                Three simple steps to never miss a birthday
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 max-w-3xl mx-auto">
              {[
                {
                  icon: UserPlus,
                  title: "Create your account",
                  description: "Sign up with your name, birthday, and phone number. It takes less than a minute.",
                  gradient: "from-pink-500/20 to-violet-500/20",
                  iconColor: "text-pink-400",
                },
                {
                  icon: Users,
                  title: "Create or join a group",
                  description: "Start a group for friends, family, or coworkers. Share an invite link so others can join.",
                  gradient: "from-blue-500/20 to-cyan-500/20",
                  iconColor: "text-blue-400",
                },
                {
                  icon: Bell,
                  title: "Get reminded automatically",
                  description: "Receive SMS reminders 1 week and 1 day before each birthday. Fully customizable.",
                  gradient: "from-violet-500/20 to-pink-500/20",
                  iconColor: "text-violet-400",
                },
              ].map((step, i) => (
                <div
                  key={step.title}
                  className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center hover:bg-white/[0.08] transition-colors"
                >
                  {/* Step number */}
                  <div className="absolute top-3 left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-slate-400">
                    {i + 1}
                  </div>

                  {/* Icon with gradient glow */}
                  <div className="mx-auto mb-4 relative w-14 h-14">
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-full blur-lg scale-150`} />
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/10 border border-white/10">
                      <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                    </div>
                  </div>

                  <h3 className="text-white font-semibold mt-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white tracking-tight">Features</h2>
              <p className="text-slate-400 mt-2 max-w-lg mx-auto">
                Everything you need to keep track of birthdays
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
              {[
                {
                  icon: CalendarDays,
                  title: "Birthday Countdown",
                  description: "See live countdowns to every upcoming birthday in your groups. Know exactly how many days are left.",
                  iconBg: "bg-blue-500/15",
                  iconColor: "text-blue-400",
                },
                {
                  icon: Bell,
                  title: "Smart Reminders",
                  description: "Configurable SMS reminders — choose how many days before each birthday you want to be notified.",
                  iconBg: "bg-violet-500/15",
                  iconColor: "text-violet-400",
                },
                {
                  icon: Link2,
                  title: "One-Click Join",
                  description: "Share an invite link with friends. They sign up, click join, and their birthday is added automatically.",
                  iconBg: "bg-pink-500/15",
                  iconColor: "text-pink-400",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/[0.08] transition-colors"
                >
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.iconBg} border border-white/10`}>
                    <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-white font-semibold">{feature.title}</h3>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Ready to never miss a birthday?
            </h2>
            <p className="text-slate-400 max-w-md mx-auto">
              Sign up for free and start tracking birthdays with your friends and
              family today.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-white text-slate-900 hover:bg-white/90"
            >
              <Link href="/signup">
                Sign Up Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-slate-500">
            <span className="text-white font-semibold">Birthly</span>
            <p className="mt-1">Never forget a birthday again.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
