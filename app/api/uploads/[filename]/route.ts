import { getCloudflareEnv } from "@/lib/d1";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILENAME = /^[a-zA-Z0-9-]+\.(?:jpg|jpeg|png|webp|avif)$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!FILENAME.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const bucket = getCloudflareEnv()?.FILES;
  if (!bucket) {
    return new Response("Not found", { status: 404 });
  }

  const object = await bucket.get(`uploads/${filename}`);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(object.body as unknown as BodyInit, {
    headers: {
      "content-type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      etag: object.httpEtag,
    },
  });
}
