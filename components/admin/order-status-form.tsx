"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Loader2, Save } from "lucide-react";
import { updateOrderAction } from "@/app/actions/admin";
import { initialActionState } from "@/lib/action-state";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";

export function OrderStatusForm({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateOrderAction,
    initialActionState,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [state.status, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={orderId} />
      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="flex items-start gap-2 border border-wine/25 bg-[#f7eaea] px-3 py-2.5 text-[0.74rem] text-wine"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {state.message}
        </div>
      )}
      {state.status === "success" && (
        <div className="flex items-start gap-2 border border-line bg-light/70 px-3 py-2.5 text-[0.74rem] text-forest">
          <Check className="mt-0.5 size-3.5 shrink-0" />
          {state.message}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="order-status" className="field-label">
            Order status
          </label>
          <select
            id="order-status"
            name="status"
            key={status}
            defaultValue={status}
            className="field"
          >
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {ORDER_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="payment-status" className="field-label">
            Payment status
          </label>
          <select
            id="payment-status"
            name="paymentStatus"
            key={paymentStatus}
            defaultValue={paymentStatus}
            className="field"
          >
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {PAYMENT_STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-[0.66rem] leading-relaxed text-muted">
        Marking payment paid means it was received through the WhatsApp
        handoff. Cancelling an order restores stock to the catalogue. Dispatch
        only after payment is confirmed.
      </p>
      <button type="submit" disabled={pending} className="btn btn-forest w-full">
        {pending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" /> Updating…
          </>
        ) : (
          <>
            <Save className="size-3.5" /> Update order
          </>
        )}
      </button>
    </form>
  );
}
