import type { ReactNode } from "react";
import RoleLayout from "@/views/layout/RoleLayout";
export default function Layout({ children }: { children: ReactNode }) {
  return <RoleLayout peran="TK">{children}</RoleLayout>;
}
