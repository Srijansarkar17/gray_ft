"use client";

import { motion } from "framer-motion";
import { Bot, Brain, Cpu, Database, Lock, BarChart, Zap, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Brain,
    title: "Advanced Machine Learning",
    description: "Self-improving agents that learn from every interaction and adapt to your specific needs.",
    color: "blue",
  },
  {
    icon: Lock,
    title: "Enterprise-Grade Security",
    description: "End-to-end encryption and compliance with industry security standards to protect your data.",
    color: "indigo",
  },
  {
    icon: Cpu,
    title: "Seamless Integration",
    description: "Connect with your existing tools and workflows through our extensive API ecosystem.",
    color: "purple",
  },
  {
    icon: Database,
    title: "Scalable Infrastructure",
    description: "Built to handle enterprise workloads with high-availability and fault tolerance.",
    color: "blue",
  },
  {
    icon: BarChart,
    title: "Real-time Analytics",
    description: "Comprehensive insights and performance metrics to optimize your business processes.",
    color: "indigo",
  },
  {
    icon: Zap,
    title: "Lightning Fast Response",
    description: "Ultra-low latency processing for time-critical operations and decision making.",
    color: "purple",
  },
  {
    icon: Bot,
    title: "Autonomous Agents",
    description: "Self-directed agents that can execute complex workflows with minimal supervision.",
    color: "blue",
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description: "Break down language barriers with agents that understand and communicate in 50+ languages.",
    color: "indigo",
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 bg-gradient-to-b from-background to-blue-950/20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-800/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Powered by{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Next-Generation AI
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Our AI agents combine cutting-edge machine learning with enterprise-grade reliability to deliver solutions that scale with your business needs.
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-background/40 backdrop-blur-sm border border-blue-900/20 p-6 rounded-xl h-full transition-all duration-300 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-600/5">
                <div className={cn(
                  "inline-flex items-center justify-center p-3 rounded-lg mb-4",
                  feature.color === "blue" ? "bg-blue-950/80 text-blue-400" :
                  feature.color === "indigo" ? "bg-indigo-950/80 text-indigo-400" :
                  "bg-purple-950/80 text-purple-400"
                )}>
                  <feature.icon className="h-6 w-6" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}