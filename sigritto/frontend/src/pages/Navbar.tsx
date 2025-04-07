"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

//import { useWallet } from '@solana/wallet-adapter-react'
import { CustomWalletMultiButton } from "@/components/walletConnect";

const navItems = [
  { name: "How it Works", path: "/how-it-works" },
  { name: "Pricing", path: "/pricing" },
]
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
    return (
        <Link
            to={to}
            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
        >
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
        </Link>
    )
}
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
                <a href="/" className="flex items-center space-x-2">
                    <img src="/icon.png" alt="Sigritto Icon" width={132} height={64} className="text-purple-500" />
                </a>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <NavLink key={item.name} to={item.path}>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
                          <CustomWalletMultiButton />
            </div>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex items-center px-5">
                <Link
                  to="/signup"
                  className="bg-purple-600 hover:bg-purple-700 text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Connect Wallet
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}