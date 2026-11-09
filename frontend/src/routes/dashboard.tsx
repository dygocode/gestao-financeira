import type { Route } from "./+types/dashboard"; import { DashboardPage } from "~/modules/dashboard/pages/dashboard-page";
export function meta({}:Route.MetaArgs){return[{title:"Visão geral | Gestão Financeira"}]}; export default DashboardPage;
