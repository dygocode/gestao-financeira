import { zodResolver } from "@hookform/resolvers/zod";
import { Landmark, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { authService } from "../services/auth.service";
import { loginSchema, type LoginFormData } from "../schemas/auth.schemas";
import { useAuthStore } from "../stores/use-auth-store";
import styles from "./auth-page.module.css";

export function LoginPage() {
  const navigate = useNavigate(); const setSession = useAuthStore((s) => s.setSession);
  const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const submit = handleSubmit(async (data) => { try { setApiError(null); setSession(await authService.login(data)); navigate("/dashboard"); } catch (error) { setApiError(error instanceof Error ? error.message : "Não foi possível entrar."); } });
  return <AuthScaffold><p className={styles.eyebrow}>Acesso seguro</p><h1 className={styles.title}>Entre no centro financeiro</h1><p className={styles.subtitle}>Acompanhe caixa, despesas e decisões em um único ambiente operacional.</p><form className={styles.form} onSubmit={submit} noValidate>{apiError && <p className={styles.apiError}>{apiError}</p>}<Field label="E-mail corporativo" error={errors.email?.message}><input type="email" autoComplete="email" placeholder="nome@empresa.com" {...register("email")}/></Field><Field label="Senha" error={errors.password?.message}><input type="password" autoComplete="current-password" placeholder="Sua senha de acesso" {...register("password")}/></Field><button className={styles.submit} disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle size={16}/> Entrando...</> : "Entrar"}</button></form><p className={styles.switch}>Ainda não tem acesso? <Link to="/register">Criar conta</Link></p></AuthScaffold>;
}

function AuthScaffold({ children }: { children: React.ReactNode }) { return <div className={styles.page}><section className={styles.formPane}><div className={styles.formWrap}><div className={styles.brand}><span className={styles.brandMark}><Landmark size={19}/></span>Gestão Financeira</div>{children}</div></section><aside className={styles.visualPane}><div className={styles.visualContent}><p className={styles.eyebrow}>Governança financeira</p><h2>Clareza para decidir. Controle para crescer.</h2><p>Uma visão rigorosa das movimentações da empresa, com dados organizados para quem precisa agir rápido e prestar contas com confiança.</p><div className={styles.proof}><div className={styles.proofItem}><strong>100%</strong><span>dados segregados por usuário</span></div><div className={styles.proofItem}><strong>15 min</strong><span>sessão segura HttpOnly</span></div><div className={styles.proofItem}><strong>1 visão</strong><span>operações consolidadas</span></div></div></div></aside></div>; }
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div className={styles.field}><label>{label}</label>{children}{error && <p className={styles.fieldError}>{error}</p>}</div>; }
export { AuthScaffold, Field };
