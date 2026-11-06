import type { ReactNode } from "react";
import { penggunaHalaman } from "@/controllers/LayoutController";
import type { Role } from "@/lib/navigation";
import WorkspaceShell from "./WorkspaceShell";
export default async function RoleLayout({
  peran,
  children,
}: {
  peran: Role;
  children: ReactNode;
}) {
  const user = await penggunaHalaman(peran);
  return (
    <WorkspaceShell peran={peran} nama={user.nama}>
      {children}
    </WorkspaceShell>
  );
}
