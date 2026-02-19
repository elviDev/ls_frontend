"use client"

import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"
import GuestOnlyWrapper from "@/components/auth/guest-only-wrapper"

export default function LoginPage() {
  return (
    <GuestOnlyWrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="container flex items-center justify-center min-h-screen py-12">
          <LoginForm />
        </div>
      </Suspense>
    </GuestOnlyWrapper>
  )
}