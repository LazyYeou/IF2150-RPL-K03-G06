import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/50 p-7 text-center sm:p-10">
      <Inbox
        className="mx-auto mb-3 size-6 text-muted-foreground"
        aria-hidden="true"
      />
      <h3 className="font-semibold">{title}</h3>
      {children && (
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          {children}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
