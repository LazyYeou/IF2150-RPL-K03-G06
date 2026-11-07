import { penggunaHalaman } from "@/controllers/LayoutController";
import WorkspaceShell from "@/views/layout/WorkspaceShell";
import SectionPlaceholder from "@/views/dashboard/SectionPlaceholder";
import { roleHome } from "@/lib/navigation";
export default async function Profil() {
  const user = await penggunaHalaman();
  return (
    <WorkspaceShell peran={user.peran} nama={user.nama}>
      <SectionPlaceholder
        title="Profil saya"
        description="Identitas dan informasi akun Kerja-In milikmu."
        home={roleHome[user.peran]}
      />
    </WorkspaceShell>
  );
}
