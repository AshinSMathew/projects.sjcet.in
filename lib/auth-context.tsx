"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db, googleProvider } from "@/lib/firebase"

interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: "student" | "admin"
  bio?: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Convert Firebase user to our User type
  const formatUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: userData.role || "student",
        bio: userData.bio || "",
        createdAt: userData.createdAt?.toDate() || new Date(),
      }
    } else {
      // Create new user in Firestore
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: firebaseUser.email === "admin@sjcet.edu" ? "admin" : "student",
        bio: "",
        createdAt: new Date(),
      }

      await setDoc(doc(db, "users", firebaseUser.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
      })

      return newUser
    }
  }

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const formattedUser = await formatUser(result.user)
    setUser(formattedUser)
  }

  const register = async (name: string, email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update profile with display name
    await updateProfile(result.user, {
      displayName: name,
    })

    const formattedUser = await formatUser(result.user)
    setUser(formattedUser)
  }

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const formattedUser = await formatUser(result.user)
    setUser(formattedUser)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const formattedUser = await formatUser(firebaseUser)
        setUser(formattedUser)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}