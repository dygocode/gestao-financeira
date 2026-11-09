import {
  ArrowLeftRight, ChartNoAxesCombined, FolderKanban, Landmark, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { authService } from "~/modules/auth/services/auth.service";
import { useAuthStore } from "~/modules/auth/stores/use-auth-store";
import { useUiStore } from "~/shared/stores/use-ui-store";
import { initials } from "~/shared/utils/format";
import styles from "./dashboard-layout.module.css";

const navItems = [
  { to: "/dashboard", label: "Visão geral", icon: ChartNoAxesCombined },
  { to: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { to: "/categories", label: "Categorias", icon: FolderKanban },
];
const titles: Record<string, string> = { "/dashboard": "Visão geral", "/transactions": "Transações", "/categories": "Categorias" };

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user)!; const clearSession = useAuthStore((s) => s.clearSession);
  const notify = useUiStore((s) => s.notify); const navigate = useNavigate(); const location = useLocation();
  const title = Object.entries(titles).find(([path]) => location.pathname.startsWith(path))?.[1] ?? "Gestão Financeira";
  const logout = async () => { try { await authService.logout(); } finally { clearSession(); notify("Sessão encerrada com segurança.", "info"); navigate("/login"); } };
  return <div className={`${styles.shell} ${collapsed ? styles.collapsed : ""}`}>
    {mobileOpen && <button className={styles.backdrop} aria-label="Fechar menu" onClick={() => setMobileOpen(false)}/>}
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ""}`}>
      <div className={styles.brand}><span className={styles.brandMark}><Landmark size={19}/></span><span className={styles.brandText}>Gestão Financeira</span><button className={styles.mobileClose} onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={18}/></button></div>
      <nav className={styles.nav} aria-label="Navegação principal">{navItems.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ""}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className={styles.sidebarFooter}><button className={styles.collapseButton} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}<span>Recolher menu</span></button></div>
    </aside>
    <div className={styles.workspace}>
      <header className={styles.topbar}><div className={styles.topbarStart}><button className={styles.menuButton} onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={20}/></button><div><span className={styles.contextLabel}>Workspace financeiro</span><strong>{title}</strong></div></div><div className={styles.topbarActions}><div className={styles.userBlock}><span className={styles.avatar}>{initials(user.name,user.email)}</span><span className={styles.userText}><strong>{user.name || "Usuário"}</strong><small>{user.email}</small></span></div><button className={styles.logoutButton} onClick={logout} aria-label="Sair"><LogOut size={18}/></button></div></header>
      <main className={styles.content}><Outlet/></main>
    </div>
  </div>;
}
