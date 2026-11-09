import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { SessionManager } from "~/app/providers/session-manager";
import { ToastViewport } from "~/shared/components/toast-viewport";
import type { Route } from "./+types/root";
import "~/styles/global.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <SessionManager>
      <Outlet />
      <ToastViewport />
    </SessionManager>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const details =
    error instanceof Error ? error.message : "Não foi possível carregar esta página.";

  return (
    <main className="route-error">
      <p className="route-error__code">{isNotFound ? "404" : "Erro"}</p>
      <h1>{isNotFound ? "Página não encontrada" : "Algo saiu do previsto"}</h1>
      <p>{details}</p>
      <a href="/">Voltar ao início</a>
    </main>
  );
}
