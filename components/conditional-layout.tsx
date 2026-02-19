"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useBroadcastSSE } from "@/hooks/use-broadcast-sse";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Check if path contains /dashboard/ (with locale prefix like /en/dashboard or /es/dashboard)
  const isDashboardPage = pathname?.match(/\/[a-z]{2}\/dashboard/)?.length > 0;

  // Listen for broadcast events via SSE globally
  useBroadcastSSE();

  if (isDashboardPage) {
    // Dashboard pages don't get the global header and footer
    return <>{children}</>;
  }

  // All other pages get the header and footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
