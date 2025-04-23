import Link from "next/link";
import { Bot, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-transparent to-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                AgentsAI
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Building next-generation AI agents to revolutionize your business operations.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="#features" 
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="#agents" 
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Our Agents
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/documentation" 
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/community" 
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 9341207002</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@agentsai.com</span>
              </li>
              <li className="flex items-start space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1" />
                <span>Greenfield City, Behala, Kolkata</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-muted">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} AgentsAI. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}