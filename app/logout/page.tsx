"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      await signOut({ redirect: false })
      router.push("/")
    }

    handleLogout()
  }, [router])

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Logging out...</p>
    </div>
  )
}
