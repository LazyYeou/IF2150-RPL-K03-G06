import Link from "next/link";
export default function Ketentuan() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-2xl space-y-5 px-6 py-12"
    >
      <h1 className="text-3xl font-semibold">Ketentuan Penggunaan</h1>
      <p className="text-sm text-muted-foreground">
        Syarat penggunaan lingkungan proyek Kerja-In.
      </p>
      <p>
        Kerja-In merupakan aplikasi proyek perkuliahan untuk mempertemukan
        tenaga kerja dan penyedia kerja. Pengguna harus berusia minimal 17
        tahun.
      </p>
      <p>
        Pilih peran sesuai kebutuhan, jaga kerahasiaan kata sandi, dan gunakan
        layanan secara bertanggung jawab. Jangan mengunggah data pribadi orang
        lain tanpa izin atau menawarkan pekerjaan yang melanggar hukum.
      </p>
      <p>
        Lingkungan pengembangan menggunakan data uji dan payment gateway mock.
        Gunakan akun serta data fiktif untuk mencoba aplikasi.
      </p>
      <h2 className="text-xl font-semibold">Kesepakatan pekerjaan</h2>
      <p>
        Tenaga kerja dan penyedia kerja perlu menyepakati ruang lingkup,
        kriteria hasil, jadwal, serta upah sebelum pekerjaan dimulai. Satu akun
        memiliki satu peran. Status verifikasi tidak menggantikan pemeriksaan
        kecocokan pekerjaan oleh para pihak.
      </p>
      <h2 className="text-xl font-semibold">Hasil dan keluhan</h2>
      <p>
        Sampaikan hasil pekerjaan dan bukti yang relevan dengan jujur. Jika ada
        kendala, catat kronologi dan bukti pendukung agar dapat diperiksa
        melalui alur penanganan keluhan.
      </p>
      <Link
        href="/privasi"
        className="inline-flex min-h-11 items-center underline"
      >
        Baca Kebijakan Privasi
      </Link>
      <br />
      <Link
        href="/daftar"
        className="inline-flex min-h-11 items-center underline"
      >
        Kembali ke pendaftaran
      </Link>
    </main>
  );
}
