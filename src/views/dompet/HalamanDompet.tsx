import { ambilDompetSaya } from "@/controllers/DompetController";
import DompetUI from "./DompetUI";

export default async function HalamanDompet() {
  const dompet = await ambilDompetSaya();
  return <DompetUI dompet={dompet} />;
}
