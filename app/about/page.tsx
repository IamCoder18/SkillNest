import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Wrench, Lightbulb, Handshake, Shield, Users, Leaf, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-primary pt-24">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 text-primary-foreground">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance lg:text-5xl">
              Who We Are & Why We Exist
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-3xl mx-auto text-pretty md:text-xl">
              SkillNest was born from a simple idea: everyone should have access to tools, knowledge, and
              hands-on skills — without the barriers of cost, space, or expertise. From hobbyists to aspiring
              tradespeople, we want to make learning practical skills fun, safe, and social.
            </p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto">
            <img
              src="/makers.png"
              alt="Shared workshop with diverse group of people collaborating on various projects, using tools together in a welcoming community space"
              className="rounded-lg shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground text-balance md:text-5xl">
              Building a Community of Makers
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-primary/10">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Connect People with Tools</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Everyone has something to share — from a garage with a table saw to a home 3D printer.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-accent/10">
                  <Lightbulb className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold">Grow Skills & Confidence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Learn practical trades, DIY projects, and creative crafts, guided by experienced hosts.
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-secondary/10">
                  <Handshake className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold">Support Local Makers</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Build a community that thrives on mentorship, collaboration, and shared resources.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance text-center">
              From a Problem to a Movement
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                Across Alberta, the skilled trades shortage is real. Experienced tradespeople are retiring faster than
                new workers can replace them, and young people face significant barriers to entry — expensive tools,
                lack of mentorship, and limited hands-on opportunities.
              </p>
              <p>
                At the same time, thousands of Albertans own workshops, garages, and equipment that sit idle most of the
                time. They have the skills and the space, but no easy way to share them with people who want to learn.
              </p>
              <p>
                SkillNest bridges that gap. We created a simple platform where learners can find local hosts
                offering short sessions, hands-on lessons, and access to tools. It's community-first, flexible, and
                designed to make learning practical skills accessible to everyone.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">What We Believe In</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Safety First</h3>
                <p className="text-muted-foreground text-sm">
                  Every session prioritizes proper safety guidelines and equipment
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Open & Inclusive</h3>
                <p className="text-muted-foreground text-sm">
                  A welcoming community for all skill levels and backgrounds
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">Practical Learning</h3>
                <p className="text-muted-foreground text-sm">Hands-on experience over theory — learn by doing</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Sustainability</h3>
                <p className="text-muted-foreground text-sm">Share tools, reduce waste, build community resilience</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-secondary">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground text-balance">
            Ready to start learning, teaching, or sharing tools?
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
