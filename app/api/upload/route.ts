import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const key = formData.get("key");

    if (!file || !(file instanceof Blob) || typeof key !== "string" || !key) {
      return NextResponse.json({ message: "Missing file or key" }, { status: 400 });
    }

    const authorization = request.headers.get("authorization");
    const tenantId = request.headers.get("x-tenant-id");
    const contentType = file.type || "application/octet-stream";

    const presignedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authorization) presignedHeaders.Authorization = authorization;
    if (tenantId) presignedHeaders["x-tenant-id"] = tenantId;

    const presignedRes = await fetch(`${API_URL}/upload/presigned-url`, {
      method: "POST",
      headers: presignedHeaders,
      body: JSON.stringify({ key, contentType }),
    });

    if (!presignedRes.ok) {
      const error = await presignedRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: (error as { message?: string }).message || "Failed to get presigned URL" },
        { status: presignedRes.status },
      );
    }

    const { url, publicUrl } = (await presignedRes.json()) as {
      url: string;
      publicUrl: string;
    };

    const uploadRes = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });

    if (!uploadRes.ok) {
      return NextResponse.json(
        { message: "Failed to upload file to storage" },
        { status: 502 },
      );
    }

    return NextResponse.json({ publicUrl });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
