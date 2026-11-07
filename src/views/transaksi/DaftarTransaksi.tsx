import Link from "next/link";

type Item = {
  id: string;
  judul: string;
  status: string;
  nominalUpah: number;
  createdAt: string;
};

export default function DaftarTransaksi({
  items,
  detailPath,
}: {
  items: Item[];
  detailPath: "tk" | "pk";
}) {
  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);

  if (items.length === 0)
    return <div className="empty-state">Belum ada transaksi.</div>;

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/${detailPath}/${detailPath === "tk" ? "pekerjaan" : "transaksi"}/${item.id}`}
          className="card block"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3>{item.judul}</h3>
              <p>{formatRupiah(item.nominalUpah)}</p>
            </div>
            <span className="status-badge">{item.status}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
