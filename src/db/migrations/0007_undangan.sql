-- #52: undangan PK ke TK untuk melamar lowongan. Satu undangan per (lowongan, TK) agar tidak bisa di-spam.
CREATE TABLE undangan_pekerjaan (
  id_lowongan     TEXT NOT NULL REFERENCES lowongan_pekerjaan(id_lowongan),
  id_tenaga_kerja TEXT NOT NULL REFERENCES tenaga_kerja(id_tenaga_kerja),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (id_lowongan, id_tenaga_kerja)
) STRICT;
