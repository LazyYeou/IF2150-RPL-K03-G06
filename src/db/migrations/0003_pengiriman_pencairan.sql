-- Reservasi berada pada pencairan_dana; tabel ini menyimpan kepastian pengiriman.
CREATE TABLE pengiriman_pencairan (
  id_pencairan TEXT PRIMARY KEY REFERENCES pencairan_dana(id_pencairan),
  status TEXT NOT NULL CHECK (status IN ('SIAP', 'MENGIRIM', 'BELUM_PASTI', 'DITERIMA', 'DITOLAK')),
  klaim TEXT,
  batas_klaim INTEGER NOT NULL DEFAULT 0
) STRICT;

-- Pengajuan lama yang masih aktif dapat direkonsiliasi menggunakan ID aslinya.
INSERT INTO pengiriman_pencairan (id_pencairan, status)
SELECT id_pencairan, 'BELUM_PASTI' FROM pencairan_dana
WHERE status_pencairan IN ('MENUNGGU_PROSES', 'DIPROSES');
