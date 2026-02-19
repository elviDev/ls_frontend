"use client"

import { RegisterForm } from "@/components/auth/register-form"
import GuestOnlyWrapper from "@/components/auth/guest-only-wrapper"

export default function RegisterPage() {
  return (
    <GuestOnlyWrapper>
      <div className="container flex items-center justify-center min-h-screen py-12">
        <RegisterForm />
      </div>
    </GuestOnlyWrapper>
  )
}