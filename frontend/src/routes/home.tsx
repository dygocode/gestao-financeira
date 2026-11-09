import { Navigate } from "react-router";
import { useAuthStore } from "~/modules/auth/stores/use-auth-store";
export default function Home() { return <Navigate to={useAuthStore((s) => s.status) === "authenticated" ? "/dashboard" : "/login"} replace/>; }
