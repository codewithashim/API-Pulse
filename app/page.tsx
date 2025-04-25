import Link from "next/link"
import { Activity, ArrowRight, CheckCircle, Clock, Globe, Zap, Bell, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">API Pulse</span>
          </div>
          <div className="hidden md:flex-1 md:flex md:items-center md:justify-center">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="transition-colors hover:text-primary">
                Features
              </Link>
              <Link href="#pricing" className="transition-colors hover:text-primary">
                Pricing
              </Link>
              <Link href="#testimonials" className="transition-colors hover:text-primary">
                Testimonials
              </Link>
              <Link href="#faq" className="transition-colors hover:text-primary">
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Keep Your APIs and Services <span className="text-primary">Always Alive</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    API Pulse automatically monitors your endpoints at scheduled intervals to prevent them from going to
                    sleep. Get real-time alerts, detailed analytics, and ensure your services stay responsive 24/7.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-1.5">
                      Start Monitoring Now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard/demo">
                    <Button size="lg" variant="outline">
                      View Live Demo
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Free tier available</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl border bg-background p-4 shadow-xl">
                  <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <div className="font-semibold">API Status Dashboard</div>
                    </div>
                    <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-1 rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">api-{i + 1}.example.com</div>
                            <div
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${i === 3 ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}
                            >
                              {i === 3 ? "Failed" : "Healthy"}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Last ping: {new Date().toLocaleTimeString()}
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${i === 3 ? "bg-red-500" : "bg-green-500"}`}
                              style={{ width: `${i === 3 ? 30 : 90 - i * 10}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Enterprise-Grade Monitoring for Everyone
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                API Pulse provides everything you need to ensure your endpoints stay responsive and your services remain
                available, with features typically found only in expensive enterprise solutions.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:max-w-5xl lg:gap-8 mt-12">
              {[
                {
                  title: "Intelligent Scheduling",
                  description:
                    "Set custom intervals to ping your endpoints - from minutes to weeks, or with custom cron expressions for precise control.",
                  icon: Clock,
                },
                {
                  title: "Real-time Monitoring",
                  description:
                    "Track response times, status codes, and success rates with detailed analytics and historical data.",
                  icon: Activity,
                },
                {
                  title: "Multi-channel Alerts",
                  description:
                    "Get instant notifications via email, Slack, or Telegram when your endpoints fail or recover.",
                  icon: Bell,
                },
                {
                  title: "Comprehensive Logs",
                  description:
                    "Access detailed logs of all ping attempts, responses, and errors for troubleshooting and auditing.",
                  icon: FileText,
                },
                {
                  title: "Advanced Request Configuration",
                  description:
                    "Configure custom headers, authentication, and request payloads to simulate real user interactions.",
                  icon: Settings,
                },
                {
                  title: "Global Monitoring",
                  description:
                    "Monitor your endpoints from multiple regions worldwide to ensure global availability and performance.",
                  icon: Globe,
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-lg border bg-background p-6 text-center shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">Simple, Transparent Pricing</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Choose the plan that fits your needs. All plans include core monitoring features.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-12">
              {/* Free Tier */}
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Free</h3>
                  <p className="text-sm text-muted-foreground">For personal projects and testing</p>
                </div>
                <div className="mb-4 flex items-baseline">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <ul className="mb-6 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Up to 5 endpoints</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Hourly monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Email notifications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>7-day history</span>
                  </li>
                </ul>
                <Button className="mt-auto" variant="outline">
                  Get Started
                </Button>
              </div>

              {/* Pro Tier */}
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm relative">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <p className="text-sm text-muted-foreground">For professionals and small teams</p>
                </div>
                <div className="mb-4 flex items-baseline">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <ul className="mb-6 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Up to 25 endpoints</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>5-minute monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Email & Slack notifications</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>30-day history</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Custom headers & payloads</span>
                  </li>
                </ul>
                <Button className="mt-auto">Subscribe Now</Button>
              </div>

              {/* Enterprise Tier */}
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Enterprise</h3>
                  <p className="text-sm text-muted-foreground">For large teams and organizations</p>
                </div>
                <div className="mb-4 flex items-baseline">
                  <span className="text-3xl font-bold">$99</span>
                  <span className="text-sm text-muted-foreground ml-1">/month</span>
                </div>
                <ul className="mb-6 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Unlimited endpoints</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>1-minute monitoring</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>All notification channels</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>1-year history</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button className="mt-auto" variant="outline">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Trusted by Developers Worldwide
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                See what our customers have to say about API Pulse
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 mt-12">
              {[
                {
                  quote:
                    "API Pulse has been a game-changer for our team. We've reduced our downtime by 90% since implementing it.",
                  author: "Sarah Johnson",
                  role: "CTO at TechStart",
                },
                {
                  quote:
                    "The real-time alerts have saved us countless hours of troubleshooting. We know immediately when something goes wrong.",
                  author: "Michael Chen",
                  role: "Lead Developer at DataFlow",
                },
                {
                  quote:
                    "Setting up API Pulse took minutes, but the peace of mind it provides is priceless. I can finally sleep at night!",
                  author: "Jessica Williams",
                  role: "Indie Developer",
                },
              ].map((testimonial, i) => (
                <div key={i} className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                  <blockquote className="flex-1">
                    <p className="text-muted-foreground">"{testimonial.quote}"</p>
                  </blockquote>
                  <div className="mt-4 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">{testimonial.author[0]}</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Find answers to common questions about API Pulse
              </p>
            </div>
            <div className="mx-auto grid max-w-3xl gap-4 mt-12">
              {[
                {
                  question: "How does API Pulse work?",
                  answer:
                    "API Pulse sends HTTP requests to your endpoints at scheduled intervals. It monitors response times, status codes, and content to ensure your services are functioning correctly. When an issue is detected, you receive instant notifications through your preferred channels.",
                },
                {
                  question: "Can I monitor authenticated endpoints?",
                  answer:
                    "Yes! API Pulse supports custom headers, allowing you to include authentication tokens, API keys, or any other headers required by your endpoints. You can also configure request payloads for POST, PUT, and other methods.",
                },
                {
                  question: "What notification channels are supported?",
                  answer:
                    "API Pulse currently supports email, Slack, and Telegram notifications. We're constantly adding more channels based on user feedback.",
                },
                {
                  question: "Is my data secure?",
                  answer:
                    "Absolutely. We use industry-standard encryption for all data in transit and at rest. Your API credentials and sensitive information are encrypted and never accessible in plain text.",
                },
                {
                  question: "Can I try API Pulse before subscribing?",
                  answer:
                    "Yes, we offer a free tier that includes all core features with limits on the number of endpoints and monitoring frequency. No credit card is required to get started.",
                },
              ].map((faq, i) => (
                <div key={i} className="rounded-lg border bg-background p-6 shadow-sm">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Ready to Keep Your Services Always Online?
              </h2>
              <p className="max-w-[85%] leading-normal sm:text-lg sm:leading-7">
                Join thousands of developers who trust API Pulse to monitor their critical endpoints.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link href="/signup">
                  <Button size="lg" variant="secondary" className="gap-1.5">
                    Start for Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <p className="text-sm leading-loose text-center md:text-left">
              &copy; {new Date().getFullYear()} API Pulse. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
