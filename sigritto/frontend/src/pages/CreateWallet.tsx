"use client"

import type React from "react";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SparklesCore } from "@/components/sparkles"
import { Plus, Trash2, ArrowLeft, Users } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast from 'react-hot-toast';

import {
    useSigrittoProgram,
} from "../components/sigritto_data/sigritto-data-access";

import { useWallet } from "@solana/wallet-adapter-react";
import { UserCategory } from '../components/sigritto_data/sigritto-exports';
import { PublicKey } from "@solana/web3.js"

export default function CreateWallet() {
    const { initialize } = useSigrittoProgram();
    const { publicKey } = useWallet();
    const navigate = useNavigate()

    // Form states
    const [owners, setOwners] = useState([
        { address: "" },
        { address: "" },
    ])
    const [threshold, setThreshold] = useState(2)
    const [category, setCategory] = useState<UserCategory>(UserCategory.Free)
    const [nonce, setNonce] = useState<number>(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!publicKey) {
        return <div>Please connect your wallet first</div>;
    }

    const addOwner = () => {
        if (owners.length < 5) {
            setOwners([...owners, { address: "" }])
        }
    }

    const removeOwner = (index: number) => {
        if (owners.length > 2) {
            const newOwners = [...owners]
            newOwners.splice(index, 1)
            setOwners(newOwners)

            if (threshold > newOwners.length) {
                setThreshold(newOwners.length)
            }
        }
    }

    const updateOwner = (index: number, field: "address", value: string) => {
        const newOwners = [...owners]
        newOwners[index][field] = value
        setOwners(newOwners)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate nonce range
        if (nonce < 0 || nonce > 5) {
            toast.error("Nonce must be between 0 and 5")
            return
        }

        setIsSubmitting(true)

        try {
            const ownerAddresses = owners.map(owner => {
                try {
                    return new PublicKey(owner.address).toString()
                } catch {
                    throw new Error(`Invalid address: ${owner.address}`)
                }
            })

            const creatorAddress = publicKey.toString()
            if (!ownerAddresses.includes(creatorAddress)) {
                ownerAddresses.push(creatorAddress)
            }

            const txSignature = await initialize.mutateAsync({
                owners: ownerAddresses,
                threshold,
                category,
                nonce,
            })

            // Success logging
            console.log('Wallet created successfully!', {
                transaction: txSignature,
                owners: ownerAddresses,
                threshold,
                category
            })
            toast.success(
                `Multisig created!`,
                { duration: 5000 }
            )

            navigate("/dashboard")
        } catch (error: any) {
            toast.error(`Creation failed: ${error.message}`)
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
                    <Link to="/dashboard" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Card className="max-w-2xl mx-auto bg-gray-900/50 border-gray-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Create Multisig Wallet</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Set up a new multisig wallet with multiple owners and a custom threshold
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nonce" className="text-white">
                                            Wallet Nonce
                                        </Label>
                                        <Input
                                            id="nonce"
                                            type="number"
                                            min="0"
                                            max="255"
                                            value={nonce}
                                            onChange={(e) => setNonce(Math.min(255, Math.max(0, parseInt(e.target.value)) || 0))}
                                            required
                                            className="bg-gray-800/50 border-gray-700"
                                        />
                                        <p className="text-sm text-gray-400">
                                            Unique identifier (0-6) for this wallet version
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-white flex items-center">
                                                <Users className="mr-2 h-4 w-4" />
                                                Wallet Owners
                                            </Label>
                                            {owners.length < 5 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addOwner}
                                                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                                                >
                                                    <Plus className="mr-1 h-3 w-3" />
                                                    Add Owner
                                                </Button>
                                            )}
                                        </div>

                                        {owners.map((owner, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-12">
                                                    <Input
                                                        placeholder="Solana Address"
                                                        value={owner.address}
                                                        onChange={(e) => updateOwner(index, "address", e.target.value)}
                                                        required
                                                        className="bg-gray-800/50 border-gray-700 font-mono text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-1 flex justify-end">
                                                    {owners.length > 2 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeOwner(index)}
                                                            className="text-gray-400 hover:text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="threshold" className="text-white">
                                            Approval Threshold
                                        </Label>
                                        <Select
                                            value={threshold.toString()}
                                            onValueChange={(value) => setThreshold(Number.parseInt(value))}
                                        >
                                            <SelectTrigger className="bg-gray-800/50 border-gray-700">
                                                <SelectValue placeholder="Select threshold" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: owners.length - 1 }, (_, i) => i + 2).map((num) => (
                                                    <SelectItem key={num} value={num.toString()}>
                                                        {num} of {owners.length} owners
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-gray-400 mt-1">
                                            {threshold} signatures will be required to approve transactions
                                        </p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-white">
                                            User Category
                                        </Label>
                                        <Select
                                            value={category}
                                            onValueChange={(value) => setCategory(value as UserCategory)}
                                        >
                                            <SelectTrigger className="bg-gray-800/50 border-gray-700">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={UserCategory.Free}>Free Tier</SelectItem>
                                                <SelectItem value={UserCategory.Pro}>Pro Tier</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Creating..." : "Create Multisig Wallet"}
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