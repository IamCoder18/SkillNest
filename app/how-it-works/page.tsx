import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-primary pt-24">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 text-primary-foreground">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance">
              How SkillHub Works
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto text-pretty">
              Whether you're a learner or a host, getting started is simple. Here's how our community connects, builds
              skills, and shares tools — all in three easy steps.
            </p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <img
              src="/placeholder.svg?height=500&width=1200"
              alt="Friendly interaction between a learner and host in a workshop, showing collaboration and mentorship"
              className="rounded-lg shadow-2xl w-full mx-0"
            />
          </div>
        </div>
      </section>

      {/* Step 1 - Browse & Book */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-3xl font-bold">
                1
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Find a Host or Workshop Near You
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>Search by skill, tool, or location.</p>
                <p>See ratings, availability, and what hosts can teach.</p>
                <p>Book short sessions, one-on-one lessons, or group workshops.</p>
              </div>
              <Card className="border-2 bg-accent/5">
                <CardContent className="p-6">
                  <p className="text-lg font-semibold mb-2">Example:</p>
                  <p className="text-muted-foreground">
                    Want to learn woodworking? Find a local garage with a table saw and a friendly host who can guide
                    you.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=600&width=600"
                alt="Screenshot mockup of search interface showing workshop listings with filters for skills, tools, and location"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 - Learn & Create */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="order-2 lg:order-1">
              <img
                src="/placeholder.svg?height=600&width=600"
                alt="Person using a table saw or 3D printer with mentor providing guidance and safety tips"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-3xl font-bold">
                2
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Hands-On Guidance Every Step of the Way
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>Learners use tools under supervision or join a lesson.</p>
                <p>Sessions are flexible: one hour, half-day, or full projects.</p>
                <p>Hosts provide tips, mentorship, and safety guidance.</p>
              </div>
              <Card className="border-2 bg-primary/5">
                <CardContent className="p-6">
                  <p className="text-lg font-semibold mb-2">Example:</p>
                  <p className="text-muted-foreground">
                    Fix your car brakes or 3D print a prototype — get hands-on experience without buying expensive
                    equipment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 - Share & Earn */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-3xl font-bold">
                3
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                Give Back and Grow Your Workshop
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>Hosts share tools and knowledge with the community.</p>
                <p>Earn income, workshop credits, or just the joy of teaching.</p>
                <p>Build connections, grow your space, and help future makers.</p>
              </div>
              <Card className="border-2 bg-secondary/5">
                <CardContent className="p-6">
                  <p className="text-lg font-semibold mb-2">Example:</p>
                  <p className="text-muted-foreground">
                    Turn your idle garage into a monthly car repair workshop and meet awesome people while earning extra.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=600&width=600"
                alt="Host demonstrating tool usage to an engaged learner in a well-organized workshop space"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tips & Best Practices Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance text-center">
              Getting the Most Out of SkillHub
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Safety Guidelines</h3>
                  <p className="text-muted-foreground">Always confirm safety guidelines before sessions</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <CheckCircle className="h-8 w-8 text-accent" />
                  <h3 className="text-xl font-bold">Keep It Clean</h3>
                  <p className="text-muted-foreground">Leave tools clean and organized</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <CheckCircle className="h-8 w-8 text-secondary" />
                  <h3 className="text-xl font-bold">Be Respectful</h3>
                  <p className="text-muted-foreground">Be respectful of hosts and learners</p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-6 space-y-3">
                  <CheckCircle className="h-8 w-8 text-primary" />
                  <h3 className="text-xl font-bold">Ask Questions</h3>
                  <p className="text-muted-foreground">Ask questions — that's why you're here!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground text-balance">
            Ready to join the community?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/how-it-works">
              <Button size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 w-full sm:w-auto">
                Find a Workshop
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
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
      </section>
    </div>
  )
}
