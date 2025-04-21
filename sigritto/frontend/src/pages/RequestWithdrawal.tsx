"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SparklesCore } from "@/components/sparkles"
import { ArrowLeft, Send } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { PublicKey } from "@solana/web3.js"
import { useSigrittoProgram } from "../components/sigritto_data/sigritto-data-access"
import BN from "bn.js"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import toast from "react-hot-toast"

export default function RequestWithdrawal() {
    const params = useParams()
    const navigate = useNavigate()
    const walletId = params.id as string
    const [amount, setAmount] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { program, requestWithdrawal } = useSigrittoProgram()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Validate inputs
            const amountInSOL = Number.parseFloat(amount)
            if (isNaN(amountInSOL) || amountInSOL <= 0) {
                throw new Error("Invalid amount")
            }

            // Convert to lamports
            const lamports = Math.round(amountInSOL * LAMPORTS_PER_SOL)
            const amountBN = new BN(lamports)

            // Get wallet details
            const walletPublicKey = new PublicKey(walletId)
            const account = await program.account.multisigWallet.fetch(walletPublicKey)

            // Submit withdrawal request
            await requestWithdrawal.mutateAsync({
                creator: account.creator,
                nonce: account.nonce,
                amount: amountBN
            })

            // Redirect back to wallet page
            navigate(`/wallet/${walletId}`)
        } catch (error: any) {
            console.error("Error creating withdrawal request:", error)
            toast.error(`Request failed: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
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
                                    Create a new withdrawal request that requires multi-signature approval
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
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