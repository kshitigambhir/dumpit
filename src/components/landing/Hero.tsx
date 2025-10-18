
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import Link from "../ui/Link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />

      {/* Animated glow orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}

          <div className="flex flex-col justify-center h-full animate-fade-in-up">
            <div className="flex flex-col space-y-6 text-center lg:text-left">
              <div className="inline-block mb-2">
                <span className="px-4 py-2 bg-blue-950/50 border border-blue-700/50 backdrop-blur-xl rounded-full text-sm font-medium text-blue-200">
                  Your Personal Digital Vault
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4">
                <img src="/logo-with-text.png" alt="DumpIt Logo" className="w-32 h-auto inline-block mb-2 lg:mb-0" />
                <span>
                  Your Digital Memory.{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                    Organized.
                  </span>
                </span>
              </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto lg:mx-0">
                  All your links, notes, and snapshots of inspiration—secure, searchable,
                  and always in sync. Welcome to smarter personal storage.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/dashboard" tabIndex={-1} className="contents">
                    <Button variant="hero" size="lg" className="group">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Button
                    variant="glass"
                    size="lg"
                    onClick={() => {
                      const el = document.getElementById('features');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    See How It Works
                  </Button>
                </div>
                <div className="flex items-center gap-8 justify-center lg:justify-start text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-slate-900" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 border-2 border-slate-900" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 border-2 border-slate-900" />
                    </div>
                    <span>Join 10,000+ users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">★★★★★</span>
                    <span>4.9/5 rating</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Right illustration */}
          <div className="relative hidden lg:block animate-scale-in" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-3xl blur-3xl opacity-30 animate-glow-pulse" />
              <div className="relative z-10 w-full h-auto bg-gradient-to-br from-blue-900/50 to-slate-900/50 rounded-3xl border border-blue-700/50 p-8 backdrop-blur-xl">
                <div className="space-y-4">
                  <div className="h-40 bg-blue-800/30 rounded-xl" />
                  <div className="flex gap-4">
                    <div className="h-20 flex-1 bg-blue-800/30 rounded-lg" />
                    <div className="h-20 flex-1 bg-blue-800/30 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
