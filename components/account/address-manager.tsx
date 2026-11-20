"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useActionState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { AccountAddress } from "@/lib/account-types";
import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
} from "@/app/actions/account";
import { initialActionState } from "@/lib/action-state";
import { useStore } from "@/components/providers/store-provider";

function AddressForm({
  address,
  onSaved,
  onCancel,
}: {
  address?: AccountAddress;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveAddressAction,
    initialActionState,
  );

  useEffect(() => {
    if (state.status === "success") {
      const timer = window.setTimeout(onSaved, 450);
      return () => window.clearTimeout(timer);
    }
  }, [state.status, onSaved]);

  return (
    <form action={formAction} className="space-y-4">
      {address && <input type="hidden" name="id" value={address.id} />}
      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="flex items-start gap-2 border border-wine/25 bg-[#f7eaea] px-3.5 py-2.5 text-[0.76rem] text-wine"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {state.message}
        </div>
      )}
      {state.status === "success" && (
        <div className="flex items-center gap-2 border border-line bg-light/70 px-3.5 py-2.5 text-[0.76rem] text-forest">
          <Check className="size-3.5" /> {state.message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="label" className="field-label">
            Label
          </label>
          <input
            id="label"
            name="label"
            defaultValue={address?.label ?? "Home"}
            required
            maxLength={30}
            className="field"
            placeholder="Home, Studio, Parents…"
          />
          {state.errors?.label && <p className="field-error">{state.errors.label}</p>}
        </div>
        <div>
          <label htmlFor="fullName" className="field-label">
            Recipient name
          </label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={address?.fullName ?? ""}
            required
            autoComplete="name"
            className="field"
            aria-invalid={Boolean(state.errors?.fullName)}
          />
          {state.errors?.fullName && (
            <p className="field-error">{state.errors.fullName}</p>
          )}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={address?.phone ?? ""}
            required
            autoComplete="tel"
            className="field"
            aria-invalid={Boolean(state.errors?.phone)}
          />
          {state.errors?.phone && <p className="field-error">{state.errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="pincode" className="field-label">
            PIN code
          </label>
          <input
            id="pincode"
            name="pincode"
            inputMode="numeric"
            defaultValue={address?.pincode ?? ""}
            required
            autoComplete="postal-code"
            className="field"
            aria-invalid={Boolean(state.errors?.pincode)}
          />
          {state.errors?.pincode && (
            <p className="field-error">{state.errors.pincode}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="line1" className="field-label">
            Address line 1
          </label>
          <input
            id="line1"
            name="line1"
            defaultValue={address?.line1 ?? ""}
            required
            autoComplete="address-line1"
            className="field"
            placeholder="House, flat, street"
            aria-invalid={Boolean(state.errors?.line1)}
          />
          {state.errors?.line1 && <p className="field-error">{state.errors.line1}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="line2" className="field-label">
            Address line 2 <span className="font-normal normal-case tracking-normal text-muted/60">(optional)</span>
          </label>
          <input
            id="line2"
            name="line2"
            defaultValue={address?.line2 ?? ""}
            autoComplete="address-line2"
            className="field"
            placeholder="Area, landmark"
          />
        </div>
        <div>
          <label htmlFor="city" className="field-label">
            City
          </label>
          <input
            id="city"
            name="city"
            defaultValue={address?.city ?? ""}
            required
            autoComplete="address-level2"
            className="field"
            aria-invalid={Boolean(state.errors?.city)}
          />
          {state.errors?.city && <p className="field-error">{state.errors.city}</p>}
        </div>
        <div>
          <label htmlFor="state" className="field-label">
            State
          </label>
          <input
            id="state"
            name="state"
            defaultValue={address?.state ?? ""}
            required
            autoComplete="address-level1"
            className="field"
            aria-invalid={Boolean(state.errors?.state)}
          />
          {state.errors?.state && <p className="field-error">{state.errors.state}</p>}
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-[0.78rem] text-muted">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={address?.isDefault ?? false}
          className="mt-0.5 size-4 accent-[var(--color-forest)]"
        />
        Use as my default delivery address
      </label>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Cancel
        </button>
        <button type="submit" disabled={pending} className="btn btn-forest">
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" /> Saving…
            </>
          ) : (
            <>{address ? "Save changes" : "Save address"}</>
          )}
        </button>
      </div>
    </form>
  );
}

function AddressModal({
  address,
  onClose,
  onSaved,
}: {
  address?: AccountAddress;
  onClose: () => void;
  onSaved: () => void;
}) {
  const titleId = useId();

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-end justify-center sm:items-center sm:p-6"
    >
      <button
        type="button"
        aria-label="Close address form"
        onClick={onClose}
        className="absolute inset-0 bg-deep/55 backdrop-blur-sm"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-h-[92dvh] w-full max-w-2xl overflow-y-auto bg-soft shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-soft/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="eyebrow text-forest/45">
              {address ? "Edit address" : "New address"}
            </p>
            <h2 id={titleId} className="mt-1 font-display text-[1.6rem] leading-tight">
              {address ? "Update delivery details" : "Where should we deliver?"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 items-center justify-center text-forest/50 transition hover:text-forest"
          >
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5 sm:p-6">
          <AddressForm
            address={address}
            onCancel={onClose}
            onSaved={() => {
              onSaved();
              onClose();
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AddressManager({
  addresses,
  maxAddresses = 6,
}: {
  addresses: AccountAddress[];
  maxAddresses?: number;
}) {
  const router = useRouter();
  const { toast } = useStore();
  const [editing, setEditing] = useState<AccountAddress | "new" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const removeAddress = (id: string) => {
    setPendingId(id);
    const data = new FormData();
    data.set("id", id);
    startTransition(async () => {
      const result = await deleteAddressAction(initialActionState, data);
      setPendingId(null);
      setConfirmDelete(null);
      if (result.status === "error") {
        toast(result.message || "Could not remove that address.", "error");
      } else {
        toast("Address removed.", "info");
        router.refresh();
      }
    });
  };

  const makeDefault = (id: string) => {
    setPendingId(id);
    const data = new FormData();
    data.set("id", id);
    startTransition(async () => {
      const result = await setDefaultAddressAction(initialActionState, data);
      setPendingId(null);
      if (result.status === "error") {
        toast(result.message || "Could not update the default address.", "error");
      } else {
        toast("Default address updated.");
        router.refresh();
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-forest/45">Delivery details</p>
          <h2 className="mt-2 font-display text-[2rem] leading-tight sm:text-[2.4rem]">
            Your saved addresses.
          </h2>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">
            {addresses.length === 0
              ? "Add an address to make checkout quicker."
              : `${addresses.length} of ${maxAddresses} addresses saved. Your default is used first at checkout.`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          disabled={addresses.length >= maxAddresses}
          className="btn btn-forest"
          title={
            addresses.length >= maxAddresses
              ? "Remove an address to add another."
              : undefined
          }
        >
          <Plus className="size-3.5" /> Add address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="mt-6 border border-line bg-white px-5 py-14 text-center">
          <MapPin className="mx-auto size-7 text-forest/25" strokeWidth={1.3} />
          <p className="mt-4 font-display text-[1.5rem]">No addresses yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-[0.8rem] leading-relaxed text-muted">
            Save a delivery address once and it will be ready for your next
            order.
          </p>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="btn btn-outline mt-5"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="flex flex-col border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-forest/55">
                      {address.label}
                    </p>
                    {address.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-light px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.1em] text-forest">
                        <Star className="size-2.5 fill-current" /> Default
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[0.85rem] font-semibold">{address.fullName}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setEditing(address)}
                    aria-label={`Edit ${address.label} address`}
                    className="flex size-8 items-center justify-center text-forest/40 transition hover:text-forest"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDelete((current) =>
                        current === address.id ? null : address.id,
                      )
                    }
                    aria-label={`Remove ${address.label} address`}
                    className="flex size-8 items-center justify-center text-forest/40 transition hover:text-wine"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}
                <br />
                {address.city}, {address.state} {address.pincode}
                <br />
                {address.phone}
              </p>

              {confirmDelete === address.id && (
                <div className="mt-4 border border-wine/20 bg-[#f9eeee] p-3">
                  <p className="text-[0.72rem] leading-relaxed text-wine">
                    Remove this address from your account?
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => removeAddress(address.id)}
                      disabled={pendingId === address.id}
                      className="inline-flex items-center gap-1.5 bg-wine px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-60"
                    >
                      {pendingId === address.id && (
                        <Loader2 className="size-3 animate-spin" />
                      )}
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(null)}
                      className="px-2 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-muted transition hover:text-forest"
                    >
                      Keep
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                {address.isDefault ? (
                  <span className="text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-forest/35">
                    Used by default
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeDefault(address.id)}
                    disabled={pendingId === address.id}
                    className="inline-flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/55 transition hover:text-forest disabled:opacity-60"
                  >
                    {pendingId === address.id && (
                      <Loader2 className="size-3 animate-spin" />
                    )}
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(address)}
                  className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/45 transition hover:text-forest"
                >
                  Edit
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <AddressModal
            address={editing === "new" ? undefined : editing}
            onClose={() => setEditing(null)}
            onSaved={() => router.refresh()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
