'use client';

import { ReactNode } from "react";
import { useNotificationsSSE } from "@/hooks/use-notifications-sse";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  useNotificationsSSE();
  return <>{children}</>;
}
