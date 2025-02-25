"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function CTASection() {
    return (
        <section className="py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto text-center"
            >
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Secure Your Team's Funds?</h2>
                <p className="text-xl text-gray-400 mb-8">
                    Join Sigritto today and experience secure, transparent, and collaborative fund management on the Solana
                    blockchain.
                </p>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </motion.div>
        </section>
    )
}

