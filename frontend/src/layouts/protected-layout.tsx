import { Navigate } from "react-router";
import { useAuthStore } from "~/modules/auth/stores/use-auth-store";
import { DashboardLayout } from "./dashboard-layout";
export default function ProtectedLayout() { return useAuthStore((s) => s.status) !== "authenticated" ? <Navigate to="/login" replace/> : <DashboardLayout/>; }
