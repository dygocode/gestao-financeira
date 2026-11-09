import { index, layout, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("layouts/public-layout.tsx", [
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
  ]),
  layout("layouts/protected-layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("categories", "routes/categories.tsx"),
    route("transactions", "routes/transactions.tsx"),
    route("transactions/new", "routes/transaction-new.tsx"),
    route("transactions/:id/edit", "routes/transaction-edit.tsx"),
  ]),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
