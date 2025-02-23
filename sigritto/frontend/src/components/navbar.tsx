"use client"

import { Button } from "../components/ui/button"
import { Menu } from "lucide-react"
import { motion } from "framer-motion"
//import Link from "next/link"
import type React from "react" // Added import for React

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b border-white/10"
    >
      <a href="/" className="flex items-center space-x-2">
         <img src="/icon.png" alt="Sigritto Icon" width={132} height={64} className="text-purple-500" />
      </a>
      {/* <Link href="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-purple-500" />
        <span className="text-white font-medium text-xl">ResearchAI</span>
        <Image src="../../../public/icon.png" alt="Sigritto Icon" width={32} height={32} className="text-purple-500" />
      </Link> */}

      <div className="hidden md:flex items-center space-x-8">
        <NavLink href="/features">Features</NavLink>
        <NavLink href="/how-it-works">How it Works</NavLink>
        <NavLink href="/pricing">Pricing</NavLink>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        {/* <Button variant="ghost" className="text-white hover:text-purple-400">
          Sign In
        </Button> */}
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">Connect Wallet</Button>
      </div>

      <Button variant="ghost" size="icon" className="md:hidden text-white">
        <Menu className="w-6 h-6" />
      </Button>
    </motion.nav>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-gray-300 hover:text-white transition-colors relative group">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
    </a>
  )
}

