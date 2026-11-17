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

    const forwardHeaders: Record<string, string> = {};
    if (authorization) forwardHeaders.Authorization = authorization;
    if (tenantId) forwardHeaders["x-tenant-id"] = tenantId;

    const bytes = Buffer.from(await file.arrayBuffer());
    const forward = new FormData();
    forward.append("key", key);
    forward.append(
      "file",
      new Blob([bytes], { type: contentType }),
      "upload",
    );

    const uploadRes = await fetch(`${API_URL}/upload/file`, {
      method: "POST",
      headers: forwardHeaders,
      body: forward,
    });

    if (!uploadRes.ok) {
      const error = await uploadRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          message:
            (error as { message?: string }).message ||
            "Failed to upload file to storage",
        },
        { status: uploadRes.status },
      );
    }

    return NextResponse.json(await uploadRes.json());
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
