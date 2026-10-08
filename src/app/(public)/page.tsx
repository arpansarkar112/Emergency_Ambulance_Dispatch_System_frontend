import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Shield, MapPin, Activity } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center bg-background text-foreground">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-48 flex items-center justify-center">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-medium tracking-tight sm:text-6xl lg:text-7xl">
              When seconds count.
            </h1>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl font-light leading-relaxed">
              A minimalist, efficient platform connecting patients with the nearest available emergency response units instantly.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 text-md">
                Request Help Now
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto rounded-full px-8 h-12 text-md">
                How it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Visual Separator */}
      <section className="w-full border-y border-border/40 bg-muted/20 py-12">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/40">
            <div className="space-y-2">
              <h4 className="text-4xl font-medium">12m</h4>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Avg Response Time</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-medium">99%</h4>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Reliability</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-medium">24/7</h4>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Availability</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-4xl font-medium">50+</h4>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">City Coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl mb-4">Precision engineered.</h2>
            <p className="text-muted-foreground text-lg font-light max-w-[600px]">
              Designed to eliminate friction during emergencies, ensuring you get the help you need without unnecessary steps.
            </p>
          </div>
          
          <div className="grid gap-12 md:grid-cols-3">
            <div className="group space-y-4">
              <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-background transition-colors">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-medium">Instant Dispatch</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Our routing engine instantly pairs your request with the closest available unit, reducing wait times drastically.
              </p>
            </div>
            <div className="group space-y-4">
              <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-background transition-colors">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-medium">Live Tracking</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Monitor the exact location of your assigned ambulance on a minimalist map interface in real-time.
              </p>
            </div>
            <div className="group space-y-4">
              <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center mb-6 group-hover:bg-foreground group-hover:text-background transition-colors">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-medium">Verified Providers</h3>
              <p className="text-muted-foreground font-light leading-relaxed">
                Every unit in our network is thoroughly vetted, certified, and equipped to handle critical medical situations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-foreground text-background">
        <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <h2 className="text-3xl font-medium tracking-tight sm:text-5xl max-w-2xl">
            Ready to deploy? Join the network.
          </h2>
          <p className="text-muted font-light text-lg max-w-xl">
            Whether you are a healthcare provider or someone looking to secure a reliable emergency safety net.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 text-md w-full sm:w-auto text-foreground">
                Create an account
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" className="rounded-full px-8 h-12 text-md w-full sm:w-auto bg-transparent border border-muted/30 hover:bg-muted/10 text-background">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
