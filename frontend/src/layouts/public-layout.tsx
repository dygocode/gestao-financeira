import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "~/modules/auth/stores/use-auth-store";
export default function PublicLayout() { return useAuthStore((s) => s.status) === "authenticated" ? <Navigate to="/dashboard" replace/> : <Outlet/>; }
