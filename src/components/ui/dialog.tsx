"use client";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
export function Dialog({
  trigger,
  title,
  description,
  children,
}: {
  trigger: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Primitive.Root>
      <Primitive.Trigger className="min-h-11 cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
        {trigger}
      </Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" />
        <Primitive.Popup className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-background p-6 shadow-xl outline-none">
          <Primitive.Title className="pr-10 text-xl font-semibold">
            {title}
          </Primitive.Title>
          {description && (
            <Primitive.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </Primitive.Description>
          )}
          <Primitive.Close
            aria-label="Tutup dialog"
            className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-lg hover:bg-muted"
          >
            <X aria-hidden="true" className="size-5" />
            <span className="sr-only">Tutup dialog</span>
          </Primitive.Close>
          <div className="mt-5">{children}</div>
        </Primitive.Popup>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
