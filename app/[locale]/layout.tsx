import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider as ZustandAuthProvider } from "@/components/auth/auth-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { GlobalLiveKitProvider } from "@/providers/global-livekit-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import ConditionalLayout from "@/components/conditional-layout";
import { GlobalAudioProvider } from "@/components/global-audio-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/request";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CBStudio Radio",
  description:
    "Your premier destination for audiobooks, podcasts, and digital storytelling",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as any)) {
    notFound();
  }
  
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ErrorBoundary>
              <QueryProvider>
                <ZustandAuthProvider>
                  <AuthProvider>
                    <GlobalLiveKitProvider>
                      <GlobalAudioProvider>
                        <ConditionalLayout>{children}</ConditionalLayout>
                      </GlobalAudioProvider>
                    </GlobalLiveKitProvider>
                    <Toaster />
                    <SonnerToaster position="top-right" />
                  </AuthProvider>
                </ZustandAuthProvider>
              </QueryProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
