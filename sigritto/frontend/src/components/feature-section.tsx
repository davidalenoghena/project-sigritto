"use client"

import { motion } from "framer-motion"
import { Shield, Users, FileText, BarChart } from "lucide-react"

const features = [
    {
        icon: Shield,
        title: "Multisig Wallet Creation",
        description: "Create shared wallets with customizable approval thresholds for enhanced security.",
    },
    {
        icon: Users,
        title: "Transaction Requests",
        description: "Initiate and approve withdrawal requests with multi-party authorization.",
    },
    {
        icon: FileText,
        title: "Audit Trail & Transparency",
        description: "All transactions are recorded on-chain, ensuring full transparency and immutability.",
    },
    {
        icon: BarChart,
        title: "Advanced Analytics",
        description: "Track wallet balances, transaction history, and team performance with detailed insights.",
    },
]

export default function FeatureSection() {
    return (
        <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-white text-center mb-12">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white/5 rounded-lg p-6 backdrop-blur-sm"
                        >
                            <feature.icon className="w-10 h-10 text-purple-500 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

