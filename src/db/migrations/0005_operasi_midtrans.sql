-- Referensi provider dan instruksi idempoten; tidak menyimpan rekening mentah.
CREATE TABLE operasi_midtrans (
  jenis TEXT NOT NULL CHECK(jenis IN ('REFUND','DISBURSEMENT')),
  kunci TEXT NOT NULL,
  referensi_id TEXT NOT NULL,
  sidik TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('MENGIRIM','BELUM_PASTI','BERHASIL','GAGAL')),
  referensi_provider TEXT UNIQUE,
  dikirim INTEGER NOT NULL DEFAULT 0 CHECK(dikirim IN (0,1)),
  klaim TEXT,
  batas_klaim INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(jenis, kunci),
  UNIQUE(jenis, referensi_id)
) STRICT;
