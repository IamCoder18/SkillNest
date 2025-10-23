import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Car, Hammer, Scissors, Printer, Home, ArrowRight, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary px-32 pt-32 pb-18">
        <div className="container mx-auto px-4 pb-32 md:pb-5">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8 text-primary-foreground">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">
                Learn. Build. Share.
              </h1>
              <p className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed text-pretty">
                Alberta's Community for Trades & Maker Skills
              </p>
              <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-2xl">
                Connect with local experts who have the tools, space, and know-how. Whether you're a DIY beginner or a
                seasoned tinkerer, SkillNest helps you learn, build, and create — together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/browse">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 border-2 border-white bg-white text-primary hover:bg-secondary hover:text-secondary-foreground hover:border-secondary w-full sm:w-auto"
                  >
                    Find a Workshop
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard/host/setup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary w-full sm:w-auto"
                  >
                    Become a Host
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/hero.png"
                alt="Community workshop with people collaborating, using various tools like saws, 3D printers, and car lifts"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Vision Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">Why SkillNest?</h2>
            <p className="text-2xl md:text-3xl font-semibold text-muted-foreground text-balance">
              The Skills Gap Is Growing — But So Is Our Willingness to Learn.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Across Alberta, skilled trades are in high demand — yet the next generation struggles to access the tools,
              mentorship, and hands-on experience needed to learn them. At the same time, thousands of Calgarians own
              underused equipment or have expertise they're eager to share. SkillNest bridges that gap by
              connecting learners and hosts in one collaborative, community-driven platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-accent/20">
                  <Wrench className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Untapped Skills & Tools</h3>
                <p className="text-muted-foreground">Empty workshops and idle equipment waiting to be shared</p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Shared Knowledge & Opportunity</h3>
                <p className="text-muted-foreground">People learning together and building community connections</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              From Curiosity to Craft in 3 Simple Steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold">Browse & Book</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Search for local Hosts offering access to workshops, tools, or skill sessions near you.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold">Learn & Create</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Join a supervised session or a hands-on lesson — from woodworking to metal fabrication.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold">Share & Earn</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hosts share their expertise and earn income or community credits while empowering new makers.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Link href="/browse">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Exploring Workshops
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Example Offerings Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              From Home Repairs to High-Tech Prototyping
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              SkillNest brings every kind of maker under one roof. Whether you want to sharpen old skills or
              start from scratch, there's a host for you.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Woodworking</h3>
                <p className="text-muted-foreground text-sm">Furniture making, cabinetry, tool safety</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Auto Skills</h3>
                <p className="text-muted-foreground text-sm">Oil changes, brake jobs, car detailing</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Hammer className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">Metalwork & Welding</h3>
                <p className="text-muted-foreground text-sm">MIG welding, sculpture, repairs</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Scissors className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Crafts & Textiles</h3>
                <p className="text-muted-foreground text-sm">Sewing, leatherwork, upcycling</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Printer className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Digital Fabrication</h3>
                <p className="text-muted-foreground text-sm">3D printing, laser cutting, CNC</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">Home Repairs</h3>
                <p className="text-muted-foreground text-sm">Plumbing basics, electrical fixes, drywall</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Link href="/browse">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                See All Workshops
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Host Benefits Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <img
                src="/host_benefits.png"
                alt="Smiling host guiding someone on how to use a tool in a workshop"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Share Your Space, Empower Your Community
              </h2>
              <p className="text-2xl font-semibold text-muted-foreground text-balance">
                Have Tools or Expertise? Become a Host.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your garage, studio, or workshop could be the spark that inspires a new generation of makers. Earn
                income, build connections, and support local learning — all on your terms.
              </p>
              <ul className="space-y-4">
                {[
                  "Set your own schedule and pricing",
                  "Approve who uses your space",
                  "Choose to teach, rent, or both",
                  "Get community support and insurance coverage",
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-accent-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/host/setup">
                <Button size="lg" className="text-lg px-8 py-6">
                  Join as a Host
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6 mb-16 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Building Alberta's Next Generation of Makers
            </h2>
            <p className="text-2xl font-semibold text-muted-foreground text-balance">
              More Than Just a Platform — A Movement.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              SkillNest is helping close Alberta's trades gap while building stronger, more connected
              communities. By sharing tools, knowledge, and passion, we're creating a circular economy of learning — one
              project at a time.
            </p>
          </div>

          <div className="text-center mt-12">
            <Link href="/about">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Involved Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground text-balance">
            Ready to Learn, Teach, or Build Together?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                Find a Workshop
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard/host/setup">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary w-full sm:w-auto"
              >
                Become a Host
              </Button>
            </Link>
          </div>
          <p className="text-lg text-primary-foreground/90 pt-4">Empowering communities — one tool at a time.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 px-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">SkillNest</h3>
              <p className="text-sm text-secondary-foreground/80">
                Connecting communities through shared skills and tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:underline">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/host/setup" className="hover:underline">
                    Become a Host
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div></div>
          </div>
          <div className="border-t border-secondary-foreground/20 pt-8 text-center text-sm text-secondary-foreground/80">
            <p>© 2025 SkillNest. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
