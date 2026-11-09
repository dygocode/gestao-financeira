import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "~/modules/auth/stores/use-auth-store";

export function SessionManager({ children }: { children: ReactNode }) {
  const { expiresAt, clearSession } = useAuthStore();
  useEffect(() => {
    const expire = () => clearSession();
    window.addEventListener("finance:session-expired", expire);
    const remaining = expiresAt ? Math.max(0, expiresAt - Date.now()) : null;
    const timer = remaining === null ? undefined : window.setTimeout(expire, remaining);
    return () => { window.removeEventListener("finance:session-expired", expire); if (timer) window.clearTimeout(timer); };
  }, [expiresAt, clearSession]);
  return children;
}
