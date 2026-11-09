import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { useAuthStore } from "~/modules/auth/stores/use-auth-store";
import ProtectedLayout from "./protected-layout";

describe("ProtectedLayout", () => {
  it("redireciona usuários anônimos para login", () => {
    useAuthStore.getState().clearSession();
    render(<MemoryRouter initialEntries={["/dashboard"]}><Routes><Route element={<ProtectedLayout/>}><Route path="/dashboard" element={<p>Dashboard privado</p>}/></Route><Route path="/login" element={<p>Acesso seguro</p>}/></Routes></MemoryRouter>);
    expect(screen.getByText("Acesso seguro")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard privado")).not.toBeInTheDocument();
  });
});
