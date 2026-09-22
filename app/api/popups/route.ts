import { NextResponse } from "next/server";
import { getAllPopups, createPopup, updatePopup, deletePopup } from "@/lib/popups";
import { requireSuperAdmin } from "@/lib/api-auth";

export async function GET() {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const popups = await getAllPopups();
    return NextResponse.json({ success: true, popups });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to fetch popups" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (!body.title || !body.contentType) {
      return NextResponse.json(
        { error: "Title and Content Type are required" },
        { status: 400 }
      );
    }
    const created = await createPopup(body);
    return NextResponse.json({ success: true, popup: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create popup" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json(
        { error: "Popup ID is required for update" },
        { status: 400 }
      );
    }
    const updated = await updatePopup(body.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Popup not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, popup: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update popup" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Popup ID query parameter is required" },
        { status: 400 }
      );
    }
    const ok = await deletePopup(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete popup" },
      { status: 500 }
    );
  }
}
