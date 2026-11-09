import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { registerSchema, type RegisterFormData } from "../schemas/auth.schemas";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../stores/use-auth-store";
import { AuthScaffold, Field } from "./login-page";
import styles from "./auth-page.module.css";

export function RegisterPage() {
  const navigate = useNavigate(); const setSession = useAuthStore((s) => s.setSession); const [apiError, setApiError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", password: "" } });
  const submit = handleSubmit(async (data) => { try { setApiError(null); setSession(await authService.register(data)); navigate("/dashboard"); } catch (error) { setApiError(error instanceof Error ? error.message : "Não foi possível criar sua conta."); } });
  return <AuthScaffold><p className={styles.eyebrow}>Nova operação</p><h1 className={styles.title}>Crie seu ambiente financeiro</h1><p className={styles.subtitle}>Configure seu acesso e comece a organizar categorias e movimentações.</p><form className={styles.form} onSubmit={submit} noValidate>{apiError && <p className={styles.apiError}>{apiError}</p>}<Field label="Nome completo" error={errors.name?.message}><input autoComplete="name" placeholder="Como devemos chamar você?" {...register("name")}/></Field><Field label="E-mail corporativo" error={errors.email?.message}><input type="email" autoComplete="email" placeholder="nome@empresa.com" {...register("email")}/></Field><Field label="Senha" error={errors.password?.message}><input type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" {...register("password")}/></Field><button className={styles.submit} disabled={isSubmitting}>{isSubmitting ? <><LoaderCircle size={16}/> Criando...</> : "Criar conta"}</button></form><p className={styles.switch}>Já possui uma conta? <Link to="/login">Entrar</Link></p></AuthScaffold>;
}
