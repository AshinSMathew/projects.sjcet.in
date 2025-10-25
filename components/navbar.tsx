"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { LogOut, User, Menu, X, Home, LayoutDashboard, Settings } from "lucide-react"

export function Navbar() {
  const { user, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-bold text-xl text-black">
              SJCET Projects
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            
            {user && (
              <>
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link 
                    href="/admin" 
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-200 flex items-center gap-1"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-gray-200 pt-4">
            {/* Navigation Links */}
            <Link 
              href="/" 
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            
            {user && (
              <>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link 
                    href="/admin" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </>
            )}

            {/* Auth Section */}
            <div className="pt-3 border-t border-gray-200">
              {isLoading ? (
                <div className="px-4 py-2">
                  <div className="w-full h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-2">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{user.displayName}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/auth/login" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-gray-300 hover:bg-gray-50">
                      Login
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}