import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha").max(128, "Senha inválida"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(1, "Informe seu nome").max(100, "Use no máximo 100 caracteres"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(128, "Use no máximo 128 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
