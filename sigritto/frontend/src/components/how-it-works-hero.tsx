"use client"

import { motion } from "framer-motion"
import { Wallet } from "lucide-react"

export default function HowItWorksHero() {
    return (
        <section className="py-20 px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Wallet className="w-16 h-16 text-purple-500 mx-auto mb-6" />
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">How Sigritto Works</h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Secure, transparent, and collaborative fund management for teams on the Solana blockchain.
                </p>
            </motion.div>
        </section>
    )
}

