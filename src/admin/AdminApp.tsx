import { useState } from "react";
import { AdminLogin } from "@/admin/AdminLogin";
import { AdminDashboard } from "@/admin/AdminDashboard";
import { getToken } from "@/admin/api";

export const AdminApp = () => {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));

  return authed ? (
    <AdminDashboard onLogout={() => setAuthed(false)} />
  ) : (
    <AdminLogin onSuccess={() => setAuthed(true)} />
  );
};
