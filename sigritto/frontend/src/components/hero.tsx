"use client"

import { Button } from "../components/ui/button"
import { motion } from "framer-motion"
import { Wallet, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import { FloatingPaper } from "@/components/floating-paper"
import { RoboAnimation } from "@/components/robo-animation"
export default function Hero() {
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingPaper count={6} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Secure Collaboration For
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {" "}
                Teams
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto"
          >
            Create a multisignatory wallet and ensure the safety of shared funds for your team.
            Perfect for hackathons participants, freelancers, investment clubs, and DAOs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={`/create-wallet`}>
              <Button
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-8"
                    style={{ borderRadius: '0.375rem' }}
                >
                    <Wallet className="mr-2 h-5 w-5" />
                    Create Now
              </Button>
            </Link>
            <Link to={`/dashboard`}>
              <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-purple-500 hover:bg-purple-500/20"
                    style={{ borderRadius: '0.375rem' }}
                >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Dashboard
                          </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Animated robot */}
      <div className="absolute bottom-0 right-0 w-96 h-96">
        <RoboAnimation />
      </div>
    </div>
  )
}