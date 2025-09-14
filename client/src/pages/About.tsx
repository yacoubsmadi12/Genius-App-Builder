import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Lightbulb, Users, Shield } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About Genius App Builder</h1>
        <p className="text-muted-foreground text-lg">Empowering developers to build amazing apps with AI</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Team collaboration in modern office" 
            className="rounded-xl shadow-lg w-full h-auto" 
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-muted-foreground mb-6">
            We believe that building mobile apps should be accessible to everyone, regardless of their coding experience. Our AI-powered platform democratizes app development by turning natural language descriptions into production-ready Flutter applications.
          </p>
          <p className="text-muted-foreground">
            Founded by a team of experienced developers and AI researchers, we're passionate about making technology more approachable and empowering the next generation of app creators.
          </p>
        </div>
      </div>
      
      <div className="bg-muted rounded-xl p-12 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Values</h2>
          <p className="text-muted-foreground">The principles that guide everything we do</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Innovation</h3>
            <p className="text-muted-foreground">
              We push the boundaries of what's possible with AI to create better development experiences.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Accessibility</h3>
            <p className="text-muted-foreground">
              We make powerful development tools accessible to creators of all skill levels.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quality</h3>
            <p className="text-muted-foreground">
              We deliver production-ready code that meets the highest standards of quality and performance.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Ready to revolutionize how you build mobile apps?
        </p>
        <Link href="/signup">
          <Button size="lg" className="btn-primary text-lg" data-testid="button-get-started-about">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
