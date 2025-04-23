"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import Particles from "@/components/react/Particles"; // ✅ Corrected import path and assumed named export

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-background to-background z-0">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10"></div>

        {/* Particle background */}
        <Particles 
          className="absolute inset-0"
          particleCount={5000}
          particleSpread={10}
          speed={0.2}
          particleColors={["#3b82f6", "#6366f1", "#8b5cf6"]}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={80}
          sizeRandomness={0.8}
          cameraDistance={15}
        />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute top-40 left-20 w-72 h-72 bg-blue-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="flex-1 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-3 py-1.5 mb-6 rounded-full bg-blue-950/50 border border-blue-800 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-300">
                  Intelligent AI Agents for Enterprise
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400">
                  AI Agents
                </span>{" "}
                That Transform Your Business
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Deploy intelligent AI agents that learn, adapt, and execute critical tasks 
                with precision and efficiency. Experience the future of enterprise automation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 px-8"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="border-blue-700 text-foreground py-6">
                  Book a Demo
                </Button>
              </div>

              <div className="mt-8 flex items-center">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-blue-400 font-medium">500+</span> companies trust our AI agents
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="flex-1 mt-12 lg:mt-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-background/40 backdrop-blur-lg border border-blue-900/50 rounded-3xl p-6 overflow-hidden shadow-2xl">
                <div className="flex items-center mb-4">
                  <Bot className="h-8 w-8 text-blue-500 mr-2" />
                  <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="ml-2 text-sm font-medium">Agent Active</span>
                </div>

                <div className="space-y-4">
                  {["Analyzing market data...", "Generating report...", "Optimizing strategy...", "Processing completed"].map((text, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + (index * 0.2) }}
                      className={`p-3 rounded-lg ${
                        index === 3 
                          ? "bg-blue-500/20 border border-blue-500/50" 
                          : "bg-blue-900/20 border border-blue-800/50"
                      }`}
                    >
                      <p className="text-sm">{text}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-blue-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Efficiency</span>
                    <span className="text-xs text-blue-400">98%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full bg-blue-950 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: "98%" }}
                      transition={{ duration: 1, delay: 1 }}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
