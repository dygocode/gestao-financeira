import type { Route } from "./+types/login"; import { LoginPage } from "~/modules/auth/pages/login-page";
export function meta({}: Route.MetaArgs) { return [{ title: "Entrar | Gestão Financeira" }]; }
export default LoginPage;
