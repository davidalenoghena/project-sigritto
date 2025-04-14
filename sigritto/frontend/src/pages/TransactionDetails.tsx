"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SparklesCore } from "@/components/sparkles"
import { ArrowLeft, Copy, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useSigrittoProgram } from "../components/sigritto_data/sigritto-data-access"
import { PublicKey } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import BN from "bn.js"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

export default function TransactionDetails() {
    const { program, approveRequest, executeRequest } = useSigrittoProgram()
    const { publicKey } = useWallet()
    const params = useParams()
    const navigate = useNavigate()
    const walletAddress = params.id as string
    const txId = params.txId as string
    const [transaction, setTransaction] = useState<any>(null)
    const [multisigAccount, setMultisigAccount] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)
    const [executing, setExecuting] = useState(false)
    const [currentUserHasApproved, setCurrentUserHasApproved] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!program || !publicKey) return

                // Fetch multisig account
                const multisigPDA = new PublicKey(walletAddress)
                const account = await program.account.multisigWallet.fetch(multisigPDA)
                setMultisigAccount(account)

                // Find transaction
                const tx = account.pendingTransactions.find(
                    (t: any) => t.id.toString() === txId
                )

                if (!tx) {
                    navigate(`/wallet/${walletAddress}`)
                    return
                }

                setTransaction(tx)
                setCurrentUserHasApproved(
                    tx.approvals.some((a: PublicKey) => a.equals(publicKey))
                )
            } catch (error) {
                console.error("Error fetching transaction:", error)
                navigate("/dashboard")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [program, publicKey, walletAddress, txId, navigate])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const getInitials = (address: PublicKey) => {
        const addr = address.toString()
        return addr.charAt(0).toUpperCase() + addr.slice(-1).toUpperCase()
    }

    const formatDate = (timestamp: BN) => {
        return new Date(timestamp.toNumber() * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleApprove = async () => {
        if (!multisigAccount || !publicKey) return

        setApproving(true)
        try {
            await approveRequest.mutateAsync({
                creator: multisigAccount.creator,
                nonce: multisigAccount.nonce,
                transactionId: transaction.id.toNumber()
            })
            setCurrentUserHasApproved(true)
        } catch (error) {
            console.error("Error approving transaction:", error)
        } finally {
            setApproving(false)
        }
    }

    const handleExecute = async () => {
        if (!multisigAccount || !transaction) return

        setExecuting(true)
        try {
            await executeRequest.mutateAsync({
                creator: multisigAccount.creator,
                nonce: multisigAccount.nonce,
                transactionId: transaction.id.toNumber(),
                recipient: transaction.to
            })
            navigate(`/wallet/${walletAddress}`)
        } catch (error) {
            console.error("Error executing transaction:", error)
        } finally {
            setExecuting(false)
        }
    }

    if (loading) {
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
                    <div className="container mx-auto px-6 py-20 flex items-center justify-center">
                        <div className="text-white">Loading transaction details...</div>
                    </div>
                </div>
            </main>
        )
    }

    if (!transaction || !multisigAccount) return null

    const isCompleted = transaction.executed
    const approvalCount = transaction.approvals.length
    const threshold = multisigAccount.threshold
    const isOwner = publicKey !== null && multisigAccount.owners.some((owner: PublicKey) => owner.equals(publicKey));
    const canExecute = approvalCount >= threshold

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
                        to={`/wallet/${walletAddress}`}
                        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Wallet
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold text-white">Transaction Details</h1>
                                <Badge
                                    variant="outline"
                                    className={
                                        isCompleted
                                            ? "bg-green-600/20 text-green-400 border-green-500/20"
                                            : "bg-amber-600/20 text-amber-400 border-amber-500/20"
                                    }
                                >
                                    {isCompleted ? "Completed" : "Pending"}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-white">Transaction Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-gray-400 text-sm mb-1">Amount</h3>
                                                <p className="text-white text-lg font-medium">
                                                    {(transaction.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-gray-400 text-sm mb-1">Recipient</h3>
                                                <div className="flex items-center">
                                                    <p className="text-white font-mono text-sm truncate">
                                                        {transaction.to.toString()}
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 ml-1 text-gray-400 hover:text-white"
                                                        onClick={() => copyToClipboard(transaction.to.toString())}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="bg-gray-800" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-gray-400 text-sm mb-1">Requested At</h3>
                                                <p className="text-white">{formatDate(multisigAccount.createdAt)}</p>
                                            </div>
                                        </div>

                                        <Separator className="bg-gray-800" />

                                        <div>
                                            <h3 className="text-gray-400 text-sm mb-1">Wallet Address</h3>
                                            <div className="flex items-center">
                                                <p className="text-white font-mono text-sm truncate">{walletAddress}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 ml-1 text-gray-400 hover:text-white"
                                                    onClick={() => copyToClipboard(walletAddress)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {!isCompleted && isOwner && (
                                    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle className="text-white">Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {currentUserHasApproved ? (
                                                <Alert className="bg-green-900/20 border-green-500/30 text-green-400">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <AlertTitle>Already Approved</AlertTitle>
                                                    <AlertDescription>
                                                        You have already approved this transaction
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                <div className="space-y-4">
                                                    <Alert className="bg-amber-900/20 border-amber-500/30 text-amber-400">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertTitle>Approval Required</AlertTitle>
                                                        <AlertDescription>
                                                            This transaction requires your approval
                                                        </AlertDescription>
                                                    </Alert>

                                                    <Button
                                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                                        onClick={handleApprove}
                                                        disabled={approving}
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        {approving ? "Approving..." : "Approve Transaction"}
                                                    </Button>
                                                </div>
                                            )}

                                            {canExecute && (
                                                <div className="mt-4">
                                                    <Alert className="bg-green-900/20 border-green-500/30 text-green-400 mb-4">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <AlertTitle>Ready to Execute</AlertTitle>
                                                        <AlertDescription>
                                                            This transaction has received enough approvals
                                                        </AlertDescription>
                                                    </Alert>

                                                    <Button
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                        onClick={handleExecute}
                                                        disabled={executing}
                                                    >
                                                        {executing ? "Executing..." : "Execute Transaction"}
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            <div className="space-y-6">
                                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-white">Approval Status</CardTitle>
                                        <CardDescription className="text-gray-400">
                                            {threshold} of {multisigAccount.owners.length} signatures required
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-400">Progress:</span>
                                                    <span className="text-white">
                                                        {approvalCount} of {threshold}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={(approvalCount / threshold) * 100}
                                                    className="h-2 bg-gray-800"
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                {multisigAccount.owners.map((owner: PublicKey) => {
                                                    const hasApproved = transaction.approvals.some((a: PublicKey) => a.equals(owner))
                                                    return (
                                                        <div
                                                            key={owner.toString()}
                                                            className="flex items-center justify-between p-2 border border-gray-800 rounded-lg"
                                                        >
                                                            <div className="flex items-center">
                                                                <Avatar className="h-8 w-8 mr-3">
                                                                    <AvatarFallback className={hasApproved ? "bg-green-600" : "bg-gray-700"}>
                                                                        {getInitials(owner)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-white font-mono text-sm truncate">
                                                                    {owner.toString()}
                                                                </span>
                                                            </div>
                                                            {hasApproved ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-green-600/20 text-green-400 border-green-500/20"
                                                                >
                                                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                                                    Approved
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700">
                                                                    <Clock className="mr-1 h-3 w-3" />
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    )
}