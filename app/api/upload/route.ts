import { NextResponse } from "next/server";
import { updateSystemConfig, getSystemConfig } from "@/lib/config";
import { requireRoles } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Handle JSON with base64 data
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { type, dataUrl } = body; // type: "logo" | "favicon"

      const authError = type === "logo" || type === "favicon" ? await requireRoles(["SUPER_ADMIN"]) : await requireRoles(["STUDENT", "TRAINER", "COLLEGE_ADMIN", "SUPER_ADMIN"]);
      if (authError) return authError;

      if (!dataUrl) {
        return NextResponse.json({ error: "No image data provided" }, { status: 400 });
      }

      if (type === "logo") {
        updateSystemConfig({
          branding: { ...getSystemConfig().branding, logoUrl: dataUrl },
        });
      }

      return NextResponse.json({ success: true, url: dataUrl, type });
    }

    // 2. Handle multipart/form-data file upload
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "logo"; // "logo" | "favicon" | "avatar" | "evidence"

    const authError = type === "avatar"
      ? await requireRoles(["STUDENT", "TRAINER", "COLLEGE_ADMIN", "SUPER_ADMIN"])
      : (type === "logo" || type === "favicon")
        ? await requireRoles(["SUPER_ADMIN"])
        : null;
    if (authError) return authError;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Allow up to 10MB for documents and project deliverables, 2MB for images
    const maxSizeBytes = type === "evidence" ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `File exceeds the maximum permitted limit of ${type === "evidence" ? "10MB" : "2MB"}` },
        { status: 400 }
      );
    }

    if (type === "avatar" && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "Profile photos must be JPG, PNG, or WebP images." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;

    if (type === "logo") {
      updateSystemConfig({
        branding: { ...getSystemConfig().branding, logoUrl: base64Data },
      });
    }

    return NextResponse.json({
      success: true,
      url: base64Data,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      type,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
