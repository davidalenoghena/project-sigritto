"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "What is a multisignature wallet?",
        answer:
            "A multisignature wallet is a type of cryptocurrency wallet that requires multiple approvals to authorize transactions, enhancing security and preventing unauthorized access to funds.",
    },
    {
        question: "How does Sigritto ensure transparency?",
        answer:
            "Sigritto records all transactions and requests on the Solana blockchain, providing an immutable and transparent audit trail that can be viewed by all team members in real-time.",
    },
    {
        question: "Can I use Sigritto for my DAO?",
        answer:
            "Yes, Sigritto is designed to support various collaborative financial scenarios, including Decentralized Autonomous Organizations (DAOs), providing secure and transparent fund management solutions.",
    },
    {
        question: "What cryptocurrencies does Sigritto support?",
        answer:
            "Sigritto supports major Solana-native tokens such as SOL, USDC, and SRM. Additional token support and multi-currency features are planned for future updates.",
    },
]

export default function FAQSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    return (
        <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white/5 rounded-lg overflow-hidden backdrop-blur-sm"
                        >
                            <button
                                className="flex justify-between items-center w-full p-4 text-left"
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                            >
                                <span className="text-lg font-medium text-white">{faq.question}</span>
                                <ChevronDown
                                    className={`w-5 h-5 text-purple-500 transition-transform ${activeIndex === index ? "transform rotate-180" : ""
                                        }`}
                                />
                            </button>
                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="px-4 pb-4"
                                    >
                                        <p className="text-gray-400">{faq.answer}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

