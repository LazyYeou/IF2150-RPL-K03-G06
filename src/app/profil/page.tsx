import { penggunaHalaman } from "@/controllers/LayoutController";
import WorkspaceShell from "@/views/layout/WorkspaceShell";
import { ambilProfil } from "@/controllers/ProfilController";
import ProfilForm from "@/views/ProfilForm";
export default async function Profil() {
  const user = await penggunaHalaman();
  const profil = await ambilProfil();
  return (
    <WorkspaceShell peran={user.peran} nama={user.nama}>
      <ProfilForm awal={profil} />
    </WorkspaceShell>
  );
}
