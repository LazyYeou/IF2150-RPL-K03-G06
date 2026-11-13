-- Q-102 (#45): pencarian lowongan dengan FTS5 trigram. Trigram mempertahankan semantik substring
-- tak peka huruf besar-kecil seperti LIKE '%q%', tetapi memakai indeks (query minimal 3 karakter).
-- Tabel eksternal: teks tidak digandakan, hanya indeks. Sinkron lewat trigger.
CREATE VIRTUAL TABLE lowongan_fts USING fts5(
  judul, deskripsi,
  content = 'lowongan_pekerjaan', content_rowid = 'rowid',
  tokenize = 'trigram'
);
INSERT INTO lowongan_fts(lowongan_fts) VALUES ('rebuild');

CREATE TRIGGER lowongan_fts_ai AFTER INSERT ON lowongan_pekerjaan BEGIN
  INSERT INTO lowongan_fts(rowid, judul, deskripsi) VALUES (new.rowid, new.judul, new.deskripsi);
END;
CREATE TRIGGER lowongan_fts_ad AFTER DELETE ON lowongan_pekerjaan BEGIN
  INSERT INTO lowongan_fts(lowongan_fts, rowid, judul, deskripsi) VALUES ('delete', old.rowid, old.judul, old.deskripsi);
END;
CREATE TRIGGER lowongan_fts_au AFTER UPDATE OF judul, deskripsi ON lowongan_pekerjaan BEGIN
  INSERT INTO lowongan_fts(lowongan_fts, rowid, judul, deskripsi) VALUES ('delete', old.rowid, old.judul, old.deskripsi);
  INSERT INTO lowongan_fts(rowid, judul, deskripsi) VALUES (new.rowid, new.judul, new.deskripsi);
END;
