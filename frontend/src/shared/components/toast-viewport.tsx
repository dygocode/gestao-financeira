import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect } from "react";
import { useUiStore } from "~/shared/stores/use-ui-store";
import styles from "./toast-viewport.module.css";

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
export function ToastViewport() {
  const { notices, dismiss } = useUiStore();
  useEffect(() => {
    const timers = notices.map((notice) => window.setTimeout(() => dismiss(notice.id), 4500));
    return () => timers.forEach(window.clearTimeout);
  }, [notices, dismiss]);
  return (
    <div className={styles.viewport} aria-live="polite">
      {notices.map((notice) => {
        const Icon = icons[notice.tone];
        return <div className={`${styles.toast} ${styles[notice.tone]}`} key={notice.id}><Icon size={18}/><span>{notice.message}</span><button onClick={() => dismiss(notice.id)} aria-label="Fechar aviso"><X size={16}/></button></div>;
      })}
    </div>
  );
}
