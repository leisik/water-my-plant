"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export function ConfirmSubmitButton({ message, title = "Confirm deletion", onClick, disabled, ...props }: ButtonProps & { message: string; title?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const locked = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const { pending } = useFormStatus();
  const id = useId();
  const busy = submitting || pending;

  function close() {
    if (locked.current || pending) return;
    dialog.current?.close();
    trigger.current?.focus();
  }

  function confirmDeletion() {
    const form = trigger.current?.form;
    if (!form || locked.current || pending || !form.reportValidity()) return;
    locked.current = true;
    setSubmitting(true);
    form.requestSubmit();
  }

  return (
    <>
      <Button {...props} ref={trigger} type="button" disabled={disabled || busy} aria-haspopup="dialog" onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        dialog.current?.showModal();
        cancel.current?.focus();
      }} />
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-message`}
        aria-busy={busy}
        onCancel={(event) => { event.preventDefault(); close(); }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[1.5rem] border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 text-left sm:p-8">
          <span className="mb-5 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive dark:text-red-300"><Trash2 className="size-5" aria-hidden="true" /></span>
          <h2 id={`${id}-title`} className="text-2xl font-semibold">{title}</h2>
          <p id={`${id}-message`} className="mt-3 break-words text-sm leading-6 text-muted-foreground">{message}</p>
          <div className="mt-7 flex justify-end gap-3">
            <Button ref={cancel} type="button" variant="outline" className="h-11 rounded-xl px-5" disabled={busy} onClick={close}>Cancel</Button>
            <Button type="button" variant="destructive" className="h-11 rounded-xl px-5" disabled={busy} onClick={confirmDeletion}>
              {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}{busy ? "Deleting…" : "Delete"}
            </Button>
          </div>
          <span role="status" className="sr-only">{busy ? "Deleting item. Please wait." : ""}</span>
        </div>
      </dialog>
    </>
  );
}
