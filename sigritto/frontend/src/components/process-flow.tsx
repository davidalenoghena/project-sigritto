"use client"

import { motion } from "framer-motion"
import { UserPlus, Send, CheckCircle, Coins } from "lucide-react"

const steps = [
    {
        icon: UserPlus,
        title: "Create a Team Wallet",
        description: "Set up a multisig wallet and invite team members.",
    },
    {
        icon: Coins,
        title: "Fund the Wallet",
        description: "Deposit funds using various cryptocurrencies or fiat-to-crypto options.",
    },
    {
        icon: Send,
        title: "Initiate Transactions",
        description: "Any team member can create a withdrawal request.",
    },
    {
        icon: CheckCircle,
        title: "Approve and Execute",
        description: "Required number of team members approve the transaction before execution.",
    },
]

export default function ProcessFlow() {
    return (
        <section className="py-20 px-4 bg-purple-900/20">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
                <div className="relative">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="flex items-start mb-12 relative"
                        >
                            <div className="bg-purple-500 rounded-full p-3 mr-4">
                                <step.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                                <p className="text-gray-400">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-purple-500/30" />}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

