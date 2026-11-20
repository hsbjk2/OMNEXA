import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCloudflareEnv } from "@/lib/d1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 5 * 1024 * 1024;

function detectImageExtension(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  if (
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    return "avif";
  }
  return null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upload images." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  }

  const origin = request.headers.get("origin");
  const expected = process.env.APP_URL?.replace(/\/$/, "");
  if (origin && expected && origin !== expected) {
    return NextResponse.json({ error: "Invalid upload origin." }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "The upload could not be read. Use an image under 5 MB." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ACCEPTED.has(file.type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, WebP or AVIF image." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Each image must be smaller than 5 MB." },
      { status: 413 },
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = detectImageExtension(bytes);
    if (!extension) {
      return NextResponse.json(
        { error: "That file is not a readable image." },
        { status: 400 },
      );
    }

    const filename = `${randomUUID()}.${extension}`;
    const bucket = getCloudflareEnv()?.FILES;

    if (bucket) {
      await bucket.put(`uploads/${filename}`, bytes, {
        httpMetadata: { contentType: file.type },
      });
      return NextResponse.json({ url: `/api/uploads/${filename}` });
    }

    // Local development keeps the existing public/uploads workflow.
    const [{ mkdir, writeFile }, path] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), bytes);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: "The image could not be stored. Try a different file." },
      { status: 500 },
    );
  }
}
