CREATE TABLE operasi_refund (
  id_tagihan TEXT PRIMARY KEY REFERENCES tagihan_pembayaran(id_tagihan),
  id_transaksi TEXT NOT NULL UNIQUE REFERENCES transaksi_pekerjaan(id_transaksi),
  id_tiket TEXT NOT NULL UNIQUE REFERENCES tiket_sengketa(id_tiket),
  id_cs TEXT NOT NULL REFERENCES pengguna(id_pengguna),
  catatan TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('MENGIRIM','BELUM_PASTI','GAGAL','BERHASIL')),
  klaim TEXT,
  batas_klaim INTEGER NOT NULL DEFAULT 0
) STRICT;

-- Finalisasi mengubah operasi menjadi BERHASIL di transaksi DB yang sama.
CREATE TRIGGER refund_kunci_pekerjaan BEFORE UPDATE OF status_pekerjaan ON transaksi_pekerjaan
WHEN NEW.status_pekerjaan != OLD.status_pekerjaan AND EXISTS (
  SELECT 1 FROM operasi_refund WHERE id_transaksi = OLD.id_transaksi AND status != 'BERHASIL'
) BEGIN SELECT RAISE(ABORT, 'Keputusan refund sedang diproses'); END;
CREATE TRIGGER refund_kunci_tiket BEFORE UPDATE OF status_tiket, keputusan, id_transaksi ON tiket_sengketa
WHEN (NEW.status_tiket != OLD.status_tiket OR NEW.keputusan IS NOT OLD.keputusan OR NEW.id_transaksi IS NOT OLD.id_transaksi) AND EXISTS (
  SELECT 1 FROM operasi_refund WHERE id_tiket = OLD.id_tiket AND status != 'BERHASIL'
) BEGIN SELECT RAISE(ABORT, 'Keputusan refund sedang diproses'); END;
CREATE TRIGGER refund_cegah_kredit BEFORE INSERT ON mutasi_saldo
WHEN NEW.kunci_operasi LIKE 'upah:%' AND EXISTS (
  SELECT 1 FROM operasi_refund WHERE 'upah:' || id_transaksi = NEW.kunci_operasi
) BEGIN SELECT RAISE(ABORT, 'Upah tidak dapat dikredit setelah keputusan refund'); END;

CREATE TRIGGER refund_kunci_tagihan BEFORE UPDATE OF total_bayar, nominal_upah, id_transaksi, status_pembayaran ON tagihan_pembayaran
WHEN (NEW.total_bayar != OLD.total_bayar OR NEW.nominal_upah != OLD.nominal_upah OR NEW.id_transaksi != OLD.id_transaksi OR NEW.status_pembayaran != OLD.status_pembayaran) AND EXISTS (
  SELECT 1 FROM operasi_refund WHERE id_tagihan = OLD.id_tagihan AND status != 'BERHASIL'
) BEGIN SELECT RAISE(ABORT, 'Tagihan refund sedang diproses'); END;
