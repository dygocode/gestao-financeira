import type { ButtonHTMLAttributes } from "react"; import styles from "./shared-ui.module.css";
export function Button({ variant="primary", className="", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"danger" }) { return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props}/>; }
