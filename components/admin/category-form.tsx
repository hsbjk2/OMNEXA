"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Save,
} from "lucide-react";
import { saveCategoryAction } from "@/app/actions/admin";
import { initialActionState } from "@/lib/action-state";
import { slugify } from "@/lib/utils";
import { ImageUploadField } from "@/components/admin/image-upload-field";

export type AdminCategoryValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
};

export function CategoryForm({ category }: { category?: AdminCategoryValues }) {
  const [state, formAction, pending] = useActionState(
    saveCategoryAction,
    initialActionState,
  );
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(category?.slug));

  return (
    <form action={formAction} className="border border-line bg-white">
      {category?.id && <input type="hidden" name="id" value={category.id} />}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.13em] text-forest/45">
            {category ? "Edit category" : "New category"}
          </p>
          <h2 className="mt-0.5 font-display text-[1.35rem] leading-tight">
            {category ? category.name : "Add a category"}
          </h2>
        </div>
        {category && (
          <Link
            href="/admin/categories"
            className="text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/45 transition hover:text-forest"
          >
            Cancel
          </Link>
        )}
      </div>

      <div className="space-y-4 p-4">
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
            <Check className="mt-0.5 size-3.5 shrink-0" /> {state.message}
          </div>
        )}

        <div>
          <label htmlFor="category-name" className="field-label">
            Name
          </label>
          <input
            id="category-name"
            name="name"
            value={name}
            onChange={(event) => {
              const value = event.target.value;
              setName(value);
              if (!slugEdited) setSlug(slugify(value));
            }}
            required
            maxLength={80}
            className="field"
            aria-invalid={Boolean(state.errors?.name)}
          />
          {state.errors?.name && <p className="field-error">{state.errors.name}</p>}
        </div>
        <div>
          <label htmlFor="category-slug" className="field-label">
            Slug
          </label>
          <input
            id="category-slug"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugEdited(true);
            }}
            maxLength={100}
            className="field"
            aria-invalid={Boolean(state.errors?.slug)}
          />
          {state.errors?.slug && <p className="field-error">{state.errors.slug}</p>}
        </div>
        <div>
          <label htmlFor="category-description" className="field-label">
            Description
          </label>
          <textarea
            id="category-description"
            name="description"
            defaultValue={category?.description ?? ""}
            required
            rows={3}
            maxLength={500}
            className="field resize-y"
            aria-invalid={Boolean(state.errors?.description)}
          />
          {state.errors?.description && (
            <p className="field-error">{state.errors.description}</p>
          )}
        </div>
        <ImageUploadField
          name="image"
          label="Category image"
          defaultValue={category?.image ?? ""}
          error={state.errors?.image}
          hint="Portrait images work best in the category grid."
        />
        <div>
          <label htmlFor="category-sort" className="field-label">
            Sort order
          </label>
          <input
            id="category-sort"
            name="sortOrder"
            type="number"
            min={0}
            max={999}
            step={1}
            defaultValue={category?.sortOrder ?? 0}
            className="field"
          />
          {state.errors?.sortOrder && (
            <p className="field-error">{state.errors.sortOrder}</p>
          )}
          <p className="field-hint">Lower numbers appear first.</p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-between">
          {category ? (
            <Link href="/admin/categories" className="btn btn-outline">
              <ArrowLeft className="size-3.5" /> Back to list
            </Link>
          ) : (
            <span />
          )}
          <button type="submit" disabled={pending} className="btn btn-forest">
            {pending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="size-3.5" /> {category ? "Save category" : "Create category"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
