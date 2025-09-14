import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Bot, Server, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg">
        <div className="hero-pattern absolute inset-0"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Build Android Apps with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate complete Flutter apps instantly using AI. Just describe your vision, and watch as we create beautiful, functional mobile applications with your choice of backend.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="btn-primary text-lg" data-testid="button-start-building">
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="text-lg" data-testid="button-learn-more">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to create amazing mobile apps with the power of AI
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI App Generation</h3>
              <p className="text-muted-foreground">
                Describe your app in plain English and watch AI generate complete Flutter code with screens, navigation, and functionality.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <Server className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Backend Support</h3>
              <p className="text-muted-foreground">
                Choose from Firebase, Supabase, or custom Node.js backends. We'll set up authentication, database, and APIs for you.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customizable Flutter Apps</h3>
              <p className="text-muted-foreground">
                Get production-ready Flutter code that you can customize further. Download as ZIP or deploy directly to app stores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">From idea to app in just a few steps</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold mb-2">Describe Your App</h3>
              <p className="text-muted-foreground text-sm">
                Tell us what you want to build - features, design, colors, and functionality
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-accent-foreground font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold mb-2">Choose Backend</h3>
              <p className="text-muted-foreground text-sm">
                Select Firebase, Supabase, or custom Node.js for your app's data layer
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-secondary-foreground font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold mb-2">AI Generation</h3>
              <p className="text-muted-foreground text-sm">
                Watch as AI creates your complete Flutter app with screens, logic, and styling
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                4
              </div>
              <h3 className="font-semibold mb-2">Download & Deploy</h3>
              <p className="text-muted-foreground text-sm">
                Get your complete project as ZIP file ready for customization and deployment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Build Your Dream App?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join thousands of developers who've already created amazing apps with AI
          </p>
          <Link href="/signup">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-50 text-lg"
              data-testid="button-get-started-cta"
            >
              Get Started Now - It's Free!
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
