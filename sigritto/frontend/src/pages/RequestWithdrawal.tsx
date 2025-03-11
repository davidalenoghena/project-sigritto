"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SparklesCore } from "@/components/sparkles"
import { ArrowLeft, Send } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function RequestWithdrawal() {
    const params = useParams()
    const navigate = useNavigate()
    const walletId = params.id as string

    const [recipient, setRecipient] = useState("")
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Mock API call - would call your Solana program in production
            await new Promise((resolve) => setTimeout(resolve, 1500))

            console.log({
                walletId,
                recipient,
                amount: Number.parseFloat(amount),
                description,
            })

            // Redirect back to wallet page on success
            navigate(`/wallet/${walletId}`)
        } catch (error) {
            console.error("Error creating withdrawal request:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
            {/* Ambient background with moving particles */}
            <div className="h-full w-full absolute inset-0 z-0">
                <SparklesCore
                    id="tsparticlesfullpage"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={100}
                    className="w-full h-full"
                    particleColor="#FFFFFF"
                />
            </div>

            <div className="relative z-10">

                <div className="container mx-auto px-6 py-8">
                    <Link
                        to={`/wallet/${walletId}`}
                        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Wallet
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="max-w-xl mx-auto bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Request Withdrawal</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Create a new withdrawal request that requires approval from other owners
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient" className="text-white">
                                            Recipient Address
                                        </Label>
                                        <Input
                                            id="recipient"
                                            placeholder="Solana Address"
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            required
                                            className="bg-gray-800/50 border-gray-700 font-mono text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-white">
                                            Amount (SOL)
                                        </Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            placeholder="0.0"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            className="bg-gray-800/50 border-gray-700"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-white">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Purpose of this withdrawal"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                            className="bg-gray-800/50 border-gray-700 min-h-[100px]"
                                        />
                                    </div>

                                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            "Creating Request..."
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Submit Request
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </main>
    )
}

