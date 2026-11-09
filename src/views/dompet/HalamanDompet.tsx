import { ambilDataHalamanDompet } from "@/controllers/DompetController";
import DompetUI from "./DompetUI";

export default async function HalamanDompet() {
  const { dompet, statusVerifikasi } = await ambilDataHalamanDompet();
  return <DompetUI dompet={dompet} statusVerifikasi={statusVerifikasi} />;
}
