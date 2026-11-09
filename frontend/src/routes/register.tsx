import type { Route } from "./+types/register"; import { RegisterPage } from "~/modules/auth/pages/register-page";
export function meta({}: Route.MetaArgs) { return [{ title: "Criar conta | Gestão Financeira" }]; }
export default RegisterPage;
