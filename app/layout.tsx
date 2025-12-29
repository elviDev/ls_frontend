import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { GlobalLiveKitProvider } from "@/providers/global-livekit-provider"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { ErrorBoundary } from "@/components/error-boundary"
import ConditionalLayout from "@/components/conditional-layout"
import { GlobalAudioProvider } from "@/components/global-audio-provider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WaveStream Radio",
  description: "Your premier destination for podcasts, audiobooks, and live broadcasts",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>
            <QueryProvider>
              <AuthProvider>
                <GlobalLiveKitProvider>
                  <GlobalAudioProvider>
                    <ConditionalLayout>
                      {children}
                    </ConditionalLayout>
                  </GlobalAudioProvider>
                </GlobalLiveKitProvider>
                <Toaster />
                <SonnerToaster position="top-right" />
              </AuthProvider>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}


