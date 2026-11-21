"use client";

import {
  useActionState,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { saveProductAction } from "@/app/actions/admin";
import { initialActionState } from "@/lib/action-state";
import { PRODUCT_STATUSES, PRODUCT_STATUS_LABELS } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export type AdminProductValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  details: string;
  categoryId: string;
  images: string[];
  price: number;
  originalPrice: number | null;
  sku: string;
  stock: number;
  status: string;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  isDemo: boolean;
  variantLabel: string;
  variantOptions: string[];
  amazonUrl: string;
  flipkartUrl: string;
};

type CategoryOption = { id: string; name: string };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-line p-3 transition hover:border-forest/30">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 accent-[var(--color-forest)]"
      />
      <span>
        <span className="block text-[0.76rem] font-semibold text-ink">{label}</span>
        <span className="mt-0.5 block text-[0.66rem] leading-relaxed text-muted">
          {description}
        </span>
      </span>
    </label>
  );
}

function ImageManager({
  initialImages,
  error,
  onUploadingChange,
}: {
  initialImages: string[];
  error?: string;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    if (images.length + list.length > 8) {
      setUploadError("You can attach up to 8 images.");
      return;
    }
    setUploading(true);
    onUploadingChange?.(true);
    setUploadError("");
    const added: string[] = [];
    for (const file of list) {
      if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
        setUploadError("Use JPEG, PNG, WebP or AVIF images.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Each image must be smaller than 5 MB.");
        continue;
      }
      const body = new FormData();
      body.set("file", file);
      try {
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body,
        });
        const result = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !result.url) {
          setUploadError(result.error || "That image could not be uploaded.");
        } else {
          added.push(result.url);
        }
      } catch {
        setUploadError("That image could not be uploaded.");
      }
    }
    if (added.length > 0) {
      setImages((current) => [...current, ...added].slice(0, 8));
    }
    setUploading(false);
    onUploadingChange?.(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const addUrl = () => {
    const clean = url.trim();
    if (!clean) return;
    if (!clean.startsWith("/") && !/^https?:\/\//.test(clean)) {
      setUploadError("Enter a local image path or a full image URL.");
      return;
    }
    if (images.length >= 8) {
      setUploadError("You can attach up to 8 images.");
      return;
    }
    setImages((current) => [...current, clean]);
    setUrl("");
    setUploadError("");
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files?.length) {
      void uploadFiles(event.dataTransfer.files);
    }
  };

  return (
    <div>
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="flex items-center justify-between">
        <span className="field-label mb-0">Product images</span>
        <span className="text-[0.6rem] text-muted/60">{images.length}/8</span>
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="group relative aspect-square overflow-hidden border border-line bg-light"
            >
              <Image
                src={image}
                alt={`Product image ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              {index === 0 && (
                <span className="absolute left-1 top-1 rounded bg-forest px-1.5 py-0.5 text-[0.45rem] font-bold uppercase tracking-[0.08em] text-lime">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-1 bottom-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setImages((current) => {
                      const next = [...current];
                      const [item] = next.splice(index, 1);
                      next.unshift(item);
                      return next;
                    })
                  }
                  title="Make cover image"
                  className="flex size-6 items-center justify-center bg-white/90 text-forest/60 shadow-sm transition hover:text-forest"
                >
                  <Star className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImages((current) => current.filter((_, i) => i !== index))
                  }
                  title="Remove image"
                  className="flex size-6 items-center justify-center bg-white/90 text-forest/50 shadow-sm transition hover:text-wine"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-3 flex flex-col items-center justify-center border border-dashed p-5 text-center transition ${
          dragging ? "border-forest bg-light/60" : "border-line bg-soft/50"
        }`}
      >
        <Upload className="size-5 text-forest/30" strokeWidth={1.4} />
        <p className="mt-2 text-[0.72rem] text-muted">
          Drag images here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="font-semibold text-forest underline underline-offset-2"
          >
            choose files
          </button>
        </p>
        <p className="mt-1 text-[0.6rem] text-muted/55">
          JPEG, PNG, WebP or AVIF · max 5 MB each · resized on upload
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files) void uploadFiles(event.target.files);
          }}
        />
        {uploading && (
          <p className="mt-2 flex items-center gap-1.5 text-[0.68rem] text-forest">
            <Loader2 className="size-3 animate-spin" /> Uploading…
          </p>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Or paste a local path / image URL"
          className="field h-10 text-[0.76rem]"
          aria-label="Image URL"
        />
        <button type="button" onClick={addUrl} className="btn btn-outline px-3 py-2">
          <Plus className="size-3.5" /> Add
        </button>
      </div>

      {(uploadError || error) && (
        <p className="field-error">{uploadError || error}</p>
      )}
      <p className="field-hint">
        The first image is the card and product cover. Use the star to promote
        an image.
      </p>
    </div>
  );
}

export function ProductForm({
  product,
  categories,
}: {
  product?: AdminProductValues;
  categories: CategoryOption[];
}) {
  const [state, formAction, pending] = useActionState(
    saveProductAction,
    initialActionState,
  );
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product?.slug));
  const [uploading, setUploading] = useState(false);

  return (
    <form action={formAction}>
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest/45 transition hover:text-forest"
          >
            <ArrowLeft className="size-3.5" /> Products
          </Link>
          <h1 className="mt-2 font-display text-[2rem] leading-tight tracking-[-0.02em] sm:text-[2.4rem]">
            {product ? "Edit product" : "New product"}
          </h1>
          <p className="mt-1 text-[0.78rem] text-muted">
            {product
              ? `Editing ${product.name}`
              : "Add a piece to the storefront catalogue."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {product?.slug && (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="btn btn-outline"
            >
              View product
            </Link>
          )}
          <Link href="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending || uploading}
            className="btn btn-forest"
          >
            {pending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="size-3.5" /> {product ? "Save changes" : "Create product"}
              </>
            )}
          </button>
        </div>
      </div>

      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 border border-wine/25 bg-[#f7eaea] px-4 py-3 text-[0.78rem] text-wine"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-5">
          <section className="border border-line bg-white p-5">
            <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest/45">
              Product details
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="field-label">
                  Product name
                </label>
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => {
                    const value = event.target.value;
                    setName(value);
                    if (!slugEdited) setSlug(slugify(value));
                  }}
                  required
                  maxLength={120}
                  className="field"
                  aria-invalid={Boolean(state.errors?.name)}
                />
                <FieldError message={state.errors?.name} />
              </div>
              <div>
                <label htmlFor="slug" className="field-label">
                  URL slug
                </label>
                <div className="flex items-center border border-line bg-white focus-within:border-forest focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-lime)_28%,transparent)]">
                  <span className="shrink-0 border-r border-line px-3 text-[0.72rem] text-muted/50">
                    /product/
                  </span>
                  <input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value);
                      setSlugEdited(true);
                    }}
                    maxLength={140}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[0.8rem] outline-none"
                  />
                </div>
                <FieldError message={state.errors?.slug} />
              </div>
              <div>
                <label htmlFor="description" className="field-label">
                  Short description
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={product?.description ?? ""}
                  required
                  rows={4}
                  maxLength={4000}
                  className="field resize-y"
                  placeholder="How it feels, what it does, why it belongs on the shelf."
                  aria-invalid={Boolean(state.errors?.description)}
                />
                <FieldError message={state.errors?.description} />
              </div>
              <div>
                <label htmlFor="details" className="field-label">
                  Details <span className="font-normal normal-case tracking-normal text-muted/60">(optional)</span>
                </label>
                <textarea
                  id="details"
                  name="details"
                  defaultValue={product?.details ?? ""}
                  rows={4}
                  maxLength={4000}
                  className="field resize-y"
                  placeholder="Ingredients, materials, dimensions, care notes — one point per line."
                />
              </div>
              <div>
                <label htmlFor="categoryId" className="field-label">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={product?.categoryId ?? ""}
                  required
                  className="field"
                  aria-invalid={Boolean(state.errors?.categoryId)}
                >
                  <option value="">Choose a category…</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError message={state.errors?.categoryId} />
              </div>
            </div>
          </section>

          <section className="border border-line bg-white p-5">
            <ImageManager
              initialImages={product?.images ?? []}
              error={state.errors?.images}
              onUploadingChange={setUploading}
            />
          </section>

          <section className="border border-line bg-white p-5">
            <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest/45">
              Variants
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="variantLabel" className="field-label">
                  Variant label
                </label>
                <input
                  id="variantLabel"
                  name="variantLabel"
                  defaultValue={product?.variantLabel ?? ""}
                  className="field"
                  placeholder="Shade, size, finish…"
                />
                <FieldError message={state.errors?.variantLabel} />
              </div>
              <div>
                <label htmlFor="variantOptions" className="field-label">
                  Options
                </label>
                <input
                  id="variantOptions"
                  name="variantOptions"
                  defaultValue={product?.variantOptions.join(", ") ?? ""}
                  className="field"
                  placeholder="Rose, Ember, Clay"
                />
                <FieldError message={state.errors?.variantOptions} />
              </div>
            </div>
            <p className="field-hint">
              Separate options with commas. Leave both blank for a single-option
              product. Stock is shared across variants.
            </p>
          </section>

          <section className="border border-line bg-white p-5">
            <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest/45">
              Marketplace links
            </p>
            <p className="mb-4 text-[0.66rem] leading-relaxed text-muted">
              Optional. Add this product&apos;s own Amazon or Flipkart listing.
              Buttons appear on the product page only when a complete URL is
              saved.
            </p>
            <div className="grid gap-4">
              <div>
                <label htmlFor="amazonUrl" className="field-label">
                  Amazon product URL
                </label>
                <input
                  id="amazonUrl"
                  name="amazonUrl"
                  type="url"
                  defaultValue={product?.amazonUrl ?? ""}
                  className="field"
                  placeholder="https://www.amazon.in/dp/…"
                  aria-invalid={Boolean(state.errors?.amazonUrl)}
                />
                <FieldError message={state.errors?.amazonUrl} />
              </div>
              <div>
                <label htmlFor="flipkartUrl" className="field-label">
                  Flipkart product URL
                </label>
                <input
                  id="flipkartUrl"
                  name="flipkartUrl"
                  type="url"
                  defaultValue={product?.flipkartUrl ?? ""}
                  className="field"
                  placeholder="https://www.flipkart.com/…"
                  aria-invalid={Boolean(state.errors?.flipkartUrl)}
                />
                <FieldError message={state.errors?.flipkartUrl} />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="border border-line bg-white p-5">
            <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest/45">
              Pricing &amp; stock
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="price" className="field-label">
                    Price (₹)
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={product?.price ?? 0}
                    required
                    className="field"
                    aria-invalid={Boolean(state.errors?.price)}
                  />
                  <FieldError message={state.errors?.price} />
                </div>
                <div>
                  <label htmlFor="originalPrice" className="field-label">
                    Compare at (₹)
                  </label>
                  <input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={product?.originalPrice ?? ""}
                    className="field"
                    aria-invalid={Boolean(state.errors?.originalPrice)}
                  />
                  <FieldError message={state.errors?.originalPrice} />
                </div>
              </div>
              <p className="field-hint">
                Only add a compare-at price if the product was genuinely offered
                at that price. Empty means no discount is shown.
              </p>
              <div>
                <label htmlFor="sku" className="field-label">
                  SKU
                </label>
                <input
                  id="sku"
                  name="sku"
                  defaultValue={product?.sku ?? ""}
                  required
                  maxLength={64}
                  className="field uppercase"
                  aria-invalid={Boolean(state.errors?.sku)}
                />
                <FieldError message={state.errors?.sku} />
              </div>
              <div>
                <label htmlFor="stock" className="field-label">
                  Stock on hand
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={product?.stock ?? 0}
                  required
                  className="field"
                  aria-invalid={Boolean(state.errors?.stock)}
                />
                <FieldError message={state.errors?.stock} />
              </div>
              <div>
                <label htmlFor="status" className="field-label">
                  Availability
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={product?.status ?? "AVAILABLE"}
                  className="field"
                >
                  {PRODUCT_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {PRODUCT_STATUS_LABELS[value]}
                    </option>
                  ))}
                </select>
                <FieldError message={state.errors?.status} />
                <p className="field-hint">
                  Stock at zero is marked out of stock on save. Coming-soon
                  pieces show a waitlist instead of a bag.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-line bg-white p-5">
            <p className="mb-3 text-[0.62rem] font-bold uppercase tracking-[0.13em] text-forest/45">
              Placement
            </p>
            <div className="space-y-2">
              <Toggle
                name="isPublished"
                label="Published"
                description="Visible to shoppers on the storefront."
                defaultChecked={product?.isPublished ?? true}
              />
              <Toggle
                name="isFeatured"
                label="Featured"
                description="Eligible for featured edits on the homepage."
                defaultChecked={product?.isFeatured ?? false}
              />
              <Toggle
                name="isBestSeller"
                label="Best seller"
                description="Appears in the best-seller edit."
                defaultChecked={product?.isBestSeller ?? false}
              />
              <Toggle
                name="isNewArrival"
                label="New arrival"
                description="Appears in the new-arrivals edit."
                defaultChecked={product?.isNewArrival ?? false}
              />
              <Toggle
                name="isDemo"
                label="Demo product"
                description="Shows a clear demo label on the storefront. Keep on for sample catalogue data."
                defaultChecked={product?.isDemo ?? true}
              />
            </div>
          </section>

          <section className="border border-line bg-light/50 p-4">
            <div className="flex items-start gap-2 text-[0.68rem] leading-relaxed text-forest/60">
              <Check className="mt-0.5 size-3.5 shrink-0 text-bright" />
              <p>
                Slugs and SKUs must be unique. Uploaded images are optimised to
                WebP and stored in <code className="text-[0.65rem]">/public/uploads</code>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
