"use client";

type Props = {
  transaksi: {
    judul: string;
    status: string;
    labelStatus: string;
    nominalUpah: number;
    commissionFee?: number;
    totalBayar?: number;
    tenagaKerja: string;
    penyediaKerja: string;
    timeline: Array<{ status: string; label: string; aktif: boolean; tercapai: boolean }>;
  };
};

export default function DetailTransaksi({ transaksi }: Props) {
  const rupiah = (nilai: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(nilai);

  return (
    <section className="space-y-6">
      <div className="card">
        <p className="text-sm">Ringkasan transaksi</p>
        <h1>{transaksi.judul}</h1>
        <p>Status saat ini: <strong>{transaksi.labelStatus}</strong></p>
        <p>Tenaga kerja: {transaksi.tenagaKerja}</p>
        <p>Penyedia kerja: {transaksi.penyediaKerja}</p>
      </div>

      <div className="card">
        <h2>Rincian biaya</h2>
        <p>Upah: {rupiah(transaksi.nominalUpah)}</p>
        {transaksi.commissionFee !== undefined && (
          <p>Biaya layanan: {rupiah(transaksi.commissionFee)}</p>
        )}
        {transaksi.totalBayar !== undefined && (
          <p><strong>Total: {rupiah(transaksi.totalBayar)}</strong></p>
        )}
      </div>

      <div className="card">
        <h2>Status transaksi</h2>
        <ol className="space-y-3">
          {transaksi.timeline.map((item) => (
            <li key={item.status} className={item.aktif ? "font-bold" : ""}>
              {item.tercapai ? "✓" : "○"} {item.label}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
