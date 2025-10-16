import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "All the basics—forever, for everyone.",
    features: [
      "Unlimited saves",
      "Basic organization",
      "Mobile & desktop sync",
      "Public collections",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    description: "Unlimited storage, advanced sharing, and AI-powered features.",
    features: [
      "Everything in Free",
      "Unlimited storage",
      "AI summaries & tags",
      "Advanced search",
      "Priority support",
      "Custom branding",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Start Free.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Grow Fearlessly.
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Unlock more memory, more power—upgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 bg-blue-950/30 border-blue-700/50 backdrop-blur-xl transition-all duration-300 animate-fade-in-up relative ${
                plan.popular
                  ? "shadow-[0_8px_32px_rgba(59,130,246,0.4)] scale-105"
                  : "hover:shadow-[0_8px_32px_rgba(59,130,246,0.3)]"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full text-sm font-medium text-white">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-400">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "glass"}
                className="w-full"
                size="lg"
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
