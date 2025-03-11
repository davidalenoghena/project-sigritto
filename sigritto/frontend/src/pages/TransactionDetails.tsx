"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SparklesCore } from "@/components/sparkles"
import { ArrowLeft, Copy, ExternalLink, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data - would be fetched from your Solana program in production
const mockTransactionData = {
    wallet1: {
        tx1: {
            id: "tx1",
            walletId: "wallet1",
            walletName: "Team Treasury",
            walletAddress: "GgE5bqTEXcsGRHJjrKnpcHbJR2ULMqfLiYwPkgSfcEo1",
            amount: 1.2,
            recipient: "DRvsYJQYG3HsPCpw7GXdQrNpV7QXTWrTMXEwMGvxYKPv",
            description: "Marketing expenses",
            requester: "Alice",
            requestedAt: "2025-03-09T15:30:00Z",
            approvals: ["David"],
            status: "pending",
            threshold: 2,
            owners: [
                { address: "8xF3hPFYbkmpPVKr87ntjuUxPTPayY6qLJHLM4YCyUMd", label: "David" },
                { address: "7YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB", label: "Fabian" },
                { address: "3zQ9CtDkTx4PQgHsrNcNJfNzPAM1VeXzh6JfyAYPwqMT", label: "Isaac" },
            ],
        },
        tx2: {
            id: "tx2",
            walletId: "wallet1",
            walletName: "Team Treasury",
            walletAddress: "GgE5bqTEXcsGRHJjrKnpcHbJR2ULMqfLiYwPkgSfcEo1",
            amount: 0.5,
            recipient: "6YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB",
            description: "Design work",
            requester: "Bob",
            requestedAt: "2025-03-05T10:15:00Z",
            completedAt: "2025-03-05T14:22:00Z",
            approvals: ["Fabian", "Isaac"],
            status: "completed",
            threshold: 2,
            owners: [
                { address: "8xF3hPFYbkmpPVKr87ntjuUxPTPayY6qLJHLM4YCyUMd", label: "David" },
                { address: "7YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB", label: "Fabian" },
                { address: "3zQ9CtDkTx4PQgHsrNcNJfNzPAM1VeXzh6JfyAYPwqMT", label: "Isaac" },
            ],
        },
    },
    wallet2: {
        tx4: {
            id: "tx4",
            walletId: "wallet2",
            walletName: "Project Fund",
            walletAddress: "7xF3hPFYbkmpPVKr87ntjuUxPTPayY6qLJHLM4YCyUMd",
            amount: 1.0,
            recipient: "4YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB",
            description: "Development milestone",
            requester: "David",
            requestedAt: "2025-03-07T09:20:00Z",
            completedAt: "2025-03-07T16:45:00Z",
            approvals: ["Fabian", "David"],
            status: "completed",
            threshold: 2,
            owners: [
                { address: "8xF3hPFYbkmpPVKr87ntjuUxPTPayY6qLJHLM4YCyUMd", label: "David" },
                { address: "5YHZ3rfpGzLEFYmxrxCU1Qpde2wHUBQJYnfPmkwmWMNB", label: "Fabian" },
                { address: "2zQ9CtDkTx4PQgHsrNcNJfNzPAM1VeXzh6JfyAYPwqMT", label: "Isaac" },
            ],
        },
    },
}

export default function TransactionDetails() {
    const params = useParams()
    const navigate = useNavigate()
    const walletId = params.id as string
    const txId = params.txId as string

    const [transaction, setTransaction] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [executing, setExecuting] = useState(false)
    //const [currentUserIsOwner, setCurrentUserIsOwner] = useState(true) // Mock - would be determined by wallet connection Commented this for now because of unused variable setCurrentUserIsOwner
    const [currentUserIsOwner] = useState(true) // Mock - would be determined by wallet connection
    const [currentUserHasApproved, setCurrentUserHasApproved] = useState(false)

    useEffect(() => {
        // Mock API call to fetch transaction data
        const fetchTransaction = async () => {
            try {
                // Simulate API delay
                await new Promise((resolve) => setTimeout(resolve, 500))

                const walletTransactions = mockTransactionData[walletId as keyof typeof mockTransactionData]
                if (!walletTransactions) {
                    navigate("/dashboard")
                    return
                }

                const tx = walletTransactions[txId as keyof typeof walletTransactions]
                if (!tx) {
                    navigate(`/wallet/${walletId}`)
                    return
                }

                setTransaction(tx)

                // Mock user state - in production, would check if current wallet has approved
                //setCurrentUserHasApproved(tx.approvals.includes("Alice")) Commented this for now because of tx.approvals.includes("Alice") isn't yet functional
            } catch (error) {
                console.error("Error fetching transaction:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchTransaction()
    }, [walletId, txId, navigate])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        // You could add a toast notification here
    }

    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase()
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleApprove = async () => {
        setApproving(true)
        try {
            // Mock API call - would call your Solana program in production
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Update local state to reflect approval
            setTransaction({
                ...transaction,
                approvals: [...transaction.approvals, "David"],
            })
            setCurrentUserHasApproved(true)
        } catch (error) {
            console.error("Error approving transaction:", error)
        } finally {
            setApproving(false)
        }
    }

    const handleReject = async () => {
        setRejecting(true)
        try {
            // Mock API call - would call your Solana program in production
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Redirect back to wallet page on success
            navigate(`/wallet/${walletId}`)
        } catch (error) {
            console.error("Error rejecting transaction:", error)
        } finally {
            setRejecting(false)
        }
    }

    const handleExecute = async () => {
        setExecuting(true)
        try {
            // Mock API call - would call your Solana program in production
            await new Promise((resolve) => setTimeout(resolve, 1500))

            // Update local state to reflect execution
            setTransaction({
                ...transaction,
                status: "completed",
                completedAt: new Date().toISOString(),
            })
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

    if (!transaction) {
        return null // Router will redirect
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
                        <div className="mb-6">
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold text-white">Transaction Details</h1>
                                <Badge
                                    variant="outline"
                                    className={
                                        transaction.status === "completed"
                                            ? "bg-green-600/20 text-green-400 border-green-500/20"
                                            : "bg-amber-600/20 text-amber-400 border-amber-500/20"
                                    }
                                >
                                    {transaction.status === "completed" ? "Completed" : "Pending"}
                                </Badge>
                            </div>
                            <p className="text-gray-400 mt-2">From wallet: {transaction.walletName}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-white">Transaction Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h3 className="text-gray-400 text-sm mb-1">Description</h3>
                                            <p className="text-white text-lg">{transaction.description}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-gray-400 text-sm mb-1">Amount</h3>
                                                <p className="text-white text-lg font-medium">{transaction.amount} SOL</p>
                                                <p className="text-gray-400 text-sm">≈ ${(transaction.amount * 150).toFixed(2)} USD</p>
                                            </div>

                                            <div>
                                                <h3 className="text-gray-400 text-sm mb-1">Recipient</h3>
                                                <div className="flex items-center">
                                                    <p className="text-white font-mono text-sm truncate">{transaction.recipient}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 ml-1 text-gray-400 hover:text-white"
                                                        onClick={() => copyToClipboard(transaction.recipient)}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="bg-gray-800" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-gray-400 text-sm mb-1">Requested By</h3>
                                                <p className="text-white">{transaction.requester}</p>
                                            </div>

                                            <div>
                                                <h3 className="text-gray-400 text-sm mb-1">Requested At</h3>
                                                <p className="text-white">{formatDate(transaction.requestedAt)}</p>
                                            </div>
                                        </div>

                                        {transaction.status === "completed" && (
                                            <div>
                                                <h3 className="text-gray-400 text-sm mb-1">Completed At</h3>
                                                <p className="text-white">{formatDate(transaction.completedAt)}</p>
                                            </div>
                                        )}

                                        <Separator className="bg-gray-800" />

                                        <div>
                                            <h3 className="text-gray-400 text-sm mb-1">Wallet Address</h3>
                                            <div className="flex items-center">
                                                <p className="text-white font-mono text-sm truncate">{transaction.walletAddress}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 ml-1 text-gray-400 hover:text-white"
                                                    onClick={() => copyToClipboard(transaction.walletAddress)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" asChild>
                                                    <a
                                                        href={`https://explorer.solana.com/address/${transaction.walletAddress}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {transaction.status === "pending" && currentUserIsOwner && (
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
                                                        You have already approved this transaction. Waiting for other owners to approve.
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                <div className="space-y-4">
                                                    <Alert className="bg-amber-900/20 border-amber-500/30 text-amber-400">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <AlertTitle>Approval Required</AlertTitle>
                                                        <AlertDescription>
                                                            This transaction requires your approval before it can be executed.
                                                        </AlertDescription>
                                                    </Alert>

                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <Button
                                                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                                                            onClick={handleApprove}
                                                            disabled={approving}
                                                        >
                                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                                            {approving ? "Approving..." : "Approve Transaction"}
                                                        </Button>

                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                                            onClick={handleReject}
                                                            disabled={rejecting}
                                                        >
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            {rejecting ? "Rejecting..." : "Reject Transaction"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {transaction.approvals.length >= transaction.threshold && (
                                                <div className="mt-4">
                                                    <Alert className="bg-green-900/20 border-green-500/30 text-green-400 mb-4">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <AlertTitle>Ready to Execute</AlertTitle>
                                                        <AlertDescription>
                                                            This transaction has received enough approvals and can now be executed.
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
                                            {transaction.threshold} of {transaction.owners.length} signatures required
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {transaction.status === "pending" ? (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-400">Progress:</span>
                                                        <span className="text-white">
                                                            {transaction.approvals.length} of {transaction.threshold}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(transaction.approvals.length / transaction.threshold) * 100}
                                                        className="h-2 bg-gray-800"
                                                    />
                                                </div>

                                                <div className="space-y-3">
                                                    {transaction.owners.map((owner: any) => {
                                                        const hasApproved = transaction.approvals.includes(owner.label)
                                                        return (
                                                            <div
                                                                key={owner.address}
                                                                className="flex items-center justify-between p-2 border border-gray-800 rounded-lg"
                                                            >
                                                                <div className="flex items-center">
                                                                    <Avatar className="h-8 w-8 mr-3">
                                                                        <AvatarFallback className={hasApproved ? "bg-green-600" : "bg-gray-700"}>
                                                                            {getInitials(owner.label)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-white">{owner.label}</span>
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
                                        ) : (
                                            <div className="space-y-3">
                                                <Alert className="bg-green-900/20 border-green-500/30 text-green-400">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <AlertTitle>Transaction Completed</AlertTitle>
                                                    <AlertDescription>This transaction has been successfully executed.</AlertDescription>
                                                </Alert>

                                                <div className="space-y-2">
                                                    <h3 className="text-gray-400 text-sm">Approved by:</h3>
                                                    <div className="space-y-2">
                                                        {transaction.approvals.map((approver: string) => (
                                                            <div key={approver} className="flex items-center p-2 border border-gray-800 rounded-lg">
                                                                <Avatar className="h-8 w-8 mr-3">
                                                                    <AvatarFallback className="bg-green-600">{getInitials(approver)}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-white">{approver}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-white">Transaction ID</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center">
                                            <p className="text-white font-mono text-sm truncate">{transaction.id}</p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 ml-1 text-gray-400 hover:text-white"
                                                onClick={() => copyToClipboard(transaction.id)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
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

