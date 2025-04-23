"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 to-background z-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat opacity-10"></div>
      </div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-600 rounded-full opacity-10 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to transform your business with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              intelligent AI agents?
            </span>
          </h2>
          
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of forward-thinking companies that are already leveraging our AI agents to streamline operations, boost productivity, and gain competitive advantage.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 px-8"
              size="lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-blue-700 text-foreground py-6">
              Schedule a Demo
            </Button>
          </div>
          
          <div className="mt-12 p-6 bg-blue-950/30 backdrop-blur-sm border border-blue-900/50 rounded-xl max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-blue-400 mr-2" />
              <h3 className="text-xl font-medium text-blue-300">Agent Testimonial</h3>
            </div>
            <p className="text-muted-foreground italic">
              "Since implementing AgentsAI's executive assistant, we've seen a 42% increase in team productivity and saved over 20 hours per week in administrative tasks. It's been a game-changer for our operations."
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">CTO, TechForward Inc.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}