"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Bot, Briefcase, Users, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const agentTypes = [
  {
    id: "analyst",
    icon: Database,
    name: "Legal Verdict Recommender Agent",
    description: "Listens to courtroom proceedings (live or recorded), analyzes legal arguments, refers to relevant laws and precedents, and suggests a verdict with reasoning ",
    keyFeatures: [
      "Legal Verdict Recommender Agent",
      "Transcription & Segmentation",
      "LLM Legal Reasoning (Groq + Phidata)",
      "Verdict Recommendation",
      "Feedback Loop",
    ],
    color: "green",
    popular: false,
  },
  {
    id: "assistant",
    icon: Bot,
    name: "Founder Decision-Maker & Idea Validator Agent ",
    description: "Helps early-stage startup founders validate their idea, simulate market response, assess profitability, and recommend pivots or GTM strategies if needed.",
    keyFeatures: [
      "Input",
      "Idea Extraction (Groq + Phidata)",
      "Profitability Simulator",
      "Market Survey Simulation",
      "Decision-Making Engine",
      "Output",
    ],
    color: "indigo",
    popular: true,
  },
  {
    id: "sales",
    icon: Briefcase,
    name: "Calling Agent for Businesses",
    description: "Listens to courtroom proceedings (live or recorded), analyzes legal arguments, refers to relevant laws and precedents, and suggests a verdict with reasoning — assisting judges or lawyers in complex cases.",
    keyFeatures: [
      "Trigger",
      "LLM Script Generation (Groq)",
      "Voice Execution",
      "Interaction Logging",
      "Feedback Loop",
    ],
    color: "purple",
    popular: false,
  },
];

export function AgentsSection() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  return (
    <section id="agents" className="relative py-24 bg-gradient-to-b from-blue-950/20 to-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
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
              Meet Your New{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                AI Workforce
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Our specialized agents are designed to excel in specific business functions, working together or independently to drive results.
            </p>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agentTypes.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="h-full"
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              <Card className={cn(
                "h-full overflow-hidden transition-all duration-300 border-blue-900/20 bg-background/50 backdrop-blur-sm relative",
                hoveredAgent === agent.id ? "border-blue-500 shadow-lg shadow-blue-900/20" : "",
                agent.popular ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-background" : ""
              )}>
                {agent.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-b opacity-0 transition-opacity duration-300",
                  agent.color === "blue" ? "from-blue-900/10 to-transparent" : 
                  agent.color === "indigo" ? "from-indigo-900/10 to-transparent" : 
                  "from-purple-900/10 to-transparent",
                  hoveredAgent === agent.id ? "opacity-100" : ""
                )}></div>
                
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className={cn(
                      "p-2 rounded-lg mr-3",
                      agent.color === "blue" ? "bg-blue-950 text-blue-400" :
                      agent.color === "indigo" ? "bg-indigo-950 text-indigo-400" :
                      "bg-purple-950 text-purple-400"
                    )}>
                      <agent.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{agent.name}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base">
                    {agent.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {agent.keyFeatures.map((feature, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center"
                      >
                        <Check className={cn(
                          "h-5 w-5 mr-2 flex-shrink-0",
                          agent.color === "blue" ? "text-blue-500" :
                          agent.color === "indigo" ? "text-indigo-500" :
                          "text-purple-500"
                        )} />
                        <span className="text-muted-foreground text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className={cn(
                      "w-full mt-4",
                      agent.color === "blue" 
                        ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900" 
                        : agent.color === "indigo" 
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900" 
                        : "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900"
                    )}
                  >
                    Deploy Agent
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}