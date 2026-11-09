import { Link } from "react-router";
export default function NotFoundPage() { return <main className="route-error"><p className="route-error__code">404</p><h1>Página não encontrada</h1><p>O endereço informado não faz parte deste ambiente financeiro.</p><Link to="/">Voltar ao início</Link></main>; }
