"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";

export function ImageUploadField({
  name,
  label = "Image",
  defaultValue = "",
  hint,
  error,
}: {
  name: string;
  label?: string;
  defaultValue?: string;
  hint?: string;
  error?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setUploadError("Use a JPEG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("The image must be smaller than 5 MB.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const body = new FormData();
    body.set("file", file);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setUploadError(result.error || "That image could not be uploaded.");
      } else {
        setUrl(result.url);
      }
    } catch {
      setUploadError("That image could not be uploaded.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <span className="field-label">{label}</span>
      <div className="flex gap-3">
        <div className="relative size-24 shrink-0 overflow-hidden border border-line bg-light">
          {url ? (
            <>
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                onClick={() => setUrl("")}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex size-5 items-center justify-center bg-white/90 text-forest/60 transition hover:text-wine"
              >
                <X className="size-3" />
              </button>
            </>
          ) : (
            <span className="flex h-full items-center justify-center text-forest/20">
              <ImagePlus className="size-6" strokeWidth={1.3} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn btn-outline px-3 py-2"
            >
              {uploading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              {uploading ? "Uploading…" : "Upload image"}
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="/images/categories/example.webp"
            aria-label={`${label} path or URL`}
            className="field mt-2 h-9 text-[0.74rem]"
          />
          <p className="field-hint">{hint ?? "Uploaded images are optimised automatically."}</p>
        </div>
      </div>
      {(uploadError || error) && (
        <p className="field-error">{uploadError || error}</p>
      )}
    </div>
  );
}
