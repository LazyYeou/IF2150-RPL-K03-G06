CREATE TRIGGER riwayat_no_update BEFORE UPDATE ON riwayat_sengketa BEGIN SELECT RAISE(ABORT, 'riwayat_sengketa append-only'); END;
CREATE TRIGGER riwayat_no_delete BEFORE DELETE ON riwayat_sengketa BEGIN SELECT RAISE(ABORT, 'riwayat_sengketa append-only'); END;
CREATE TRIGGER mutasi_no_update  BEFORE UPDATE ON mutasi_saldo     BEGIN SELECT RAISE(ABORT, 'mutasi_saldo append-only'); END;
CREATE TRIGGER mutasi_no_delete  BEFORE DELETE ON mutasi_saldo     BEGIN SELECT RAISE(ABORT, 'mutasi_saldo append-only'); END;
CREATE TRIGGER log_no_update     BEFORE UPDATE ON log_gateway      BEGIN SELECT RAISE(ABORT, 'log_gateway append-only'); END;
CREATE TRIGGER log_no_delete     BEFORE DELETE ON log_gateway      BEGIN SELECT RAISE(ABORT, 'log_gateway append-only'); END;
