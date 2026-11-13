import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
export default function SectionPlaceholder({
  title,
  description,
  home,
}: {
  title: string;
  description: string;
  home: string;
}) {
  return (
    <>
      <p className="text-xs text-muted-foreground">Ruang kerja</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-8">
        <EmptyState title={`Ruang ${title.toLowerCase()}`}>
          Informasi {title.toLowerCase()} akan ditampilkan di sini.
        </EmptyState>
      </div>
      <Link
        className="mt-5 inline-flex min-h-11 items-center text-sm underline"
        href={home}
      >
        Kembali ke ruang kerja
      </Link>
    </>
  );
}
