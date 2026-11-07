"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** Copies the address and confirms in place; the status text is announced to screen readers. */
export function CopyEmail({ email, className = "" }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the address stays selectable.
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-ping-ignore=""
      className={`press label inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-card px-4 text-ink hover:bg-sand ${className}`}
    >
      <span key={copied ? "done" : "idle"} className="inline-flex animate-pop items-center gap-2">
        {copied ? "Copied" : "Copy"}
        <Icon name={copied ? "check" : "copy"} size={14} />
      </span>
      <span role="status" className="sr-only">
        {copied ? "Email address copied" : ""}
      </span>
    </button>
  );
}
