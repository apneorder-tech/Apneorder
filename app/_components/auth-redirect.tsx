"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthRedirect() {
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setRedirecting(true)
        window.location.href = "/dashboard"
      }
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setRedirecting(true)
        window.location.href = "/dashboard"
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!redirecting) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
    </div>
  )
}
