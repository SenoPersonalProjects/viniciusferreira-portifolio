"use client";

import { useContext } from "react";

import { AdminAuthContext } from "@/components/admin/AdminAuthProvider";

export function useAdminSession() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminSession deve ser usado dentro de AdminAuthProvider",
    );
  }

  return context;
}
