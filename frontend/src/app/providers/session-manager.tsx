import { Landmark, LoaderCircle } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { authService } from "~/modules/auth/services/auth.service";
import { useAuthStore } from "~/modules/auth/stores/use-auth-store";
import { isAbortError } from "~/shared/lib/http/api-client";

export function SessionManager({ children }: { children: ReactNode }) {
  const { status, expiresAt, setSession, clearSession } = useAuthStore();

  useEffect(() => {
    const controller = new AbortController();

    authService
      .session(controller.signal)
      .then(setSession)
      .catch((error: unknown) => {
        if (isAbortError(error, controller.signal)) return;
        clearSession();
      });

    return () => controller.abort();
  }, [setSession, clearSession]);

  useEffect(() => {
    const expire = () => clearSession();
    window.addEventListener("finance:session-expired", expire);
    const remaining = expiresAt ? Math.max(0, expiresAt - Date.now()) : null;
    const timer = remaining === null ? undefined : window.setTimeout(expire, remaining);

    return () => {
      window.removeEventListener("finance:session-expired", expire);
      if (timer) window.clearTimeout(timer);
    };
  }, [expiresAt, clearSession]);

  if (status === "checking") {
    return (
      <main className="session-loading" aria-live="polite">
        <span className="session-loading__brand"><Landmark size={21} /></span>
        <LoaderCircle className="session-loading__spinner" size={22} />
        <strong>Validando sessão segura</strong>
        <p>Aguarde enquanto confirmamos seu acesso.</p>
      </main>
    );
  }

  return children;
}
