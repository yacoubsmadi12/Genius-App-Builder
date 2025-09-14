import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Check, Zap } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Perfect for trying out",
      features: [
        "2 app generations per month",
        "Basic Flutter templates",
        "Firebase backend only",
        "Community support"
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      href: "/signup"
    },
    {
      name: "Pro",
      price: "$29",
      period: "Per month",
      description: "Most Popular",
      popular: true,
      features: [
        "Unlimited app generations",
        "Advanced Flutter templates",
        "All backend options",
        "AI-generated images",
        "Priority support",
        "APK generation"
      ],
      buttonText: "Start Pro Trial",
      buttonVariant: "default" as const,
      href: "/signup"
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "Per month",
      description: "",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Custom templates",
        "White-label solution",
        "Dedicated support",
        "SLA guarantee"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      href: "/contact"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground text-lg">Choose the plan that fits your needs</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative hover:shadow-lg transition-shadow ${
              plan.popular ? 'border-2 border-primary' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
              <div className="text-4xl font-bold mb-2">{plan.price}</div>
              <p className="text-muted-foreground">{plan.period}</p>
              {plan.description && !plan.popular && (
                <p className="text-muted-foreground">{plan.description}</p>
              )}
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link href={plan.href}>
                <Button 
                  variant={plan.buttonVariant} 
                  className={`w-full ${plan.popular ? 'btn-primary' : ''}`}
                  data-testid={`button-${plan.name.toLowerCase()}-plan`}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-4">All plans include 7-day free trial • Cancel anytime</p>
        <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
          <span>✓ 99.9% Uptime SLA</span>
          <span>✓ SSL Encryption</span>
          <span>✓ 24/7 Support</span>
        </div>
      </div>
    </div>
  );
}
