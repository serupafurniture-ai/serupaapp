import type { ReactNode } from "react";
import { SessionGate } from "@/components/layout/session-gate";
import { NotificationsProvider } from "@/features/notifications/notifications-context";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGate>
      <NotificationsProvider>{children}</NotificationsProvider>
    </SessionGate>
  );
}
