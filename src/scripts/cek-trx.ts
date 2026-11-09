import { bukaDb } from "../db/open";

const db = bukaDb();
const query = `
  SELECT t.id_transaksi AS idTransaksi,
         t.id_penyedia_kerja AS idPenyediaKerja,
         t.id_tenaga_kerja AS idTenagaKerja,
         t.status_pekerjaan AS statusPekerjaan,
         t.nominal_upah AS nominalUpah,
         pk.id_pengguna AS idPenggunaPK,
         tk.id_pengguna AS idPenggunaTK,
         l.judul AS judulLowongan,
         utk.nama AS namaTenagaKerja
  FROM transaksi_pekerjaan t
  JOIN lowongan_pekerjaan l ON l.id_lowongan = t.id_lowongan
  JOIN penyedia_kerja pk ON pk.id_penyedia_kerja = t.id_penyedia_kerja
  JOIN tenaga_kerja tk ON tk.id_tenaga_kerja = t.id_tenaga_kerja
  JOIN pengguna utk ON utk.id_pengguna = tk.id_pengguna
  WHERE t.id_transaksi = ?
`;

const res = db.prepare(query).get("b454d6b2-d94a-44ce-991d-262e035830b9");
console.log("HASIL_QUERY:", JSON.stringify(res, null, 2));
db.close();
