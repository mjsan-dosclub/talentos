import { NextResponse } from "next/server";
import { getLandingCms, updateLandingCms, resetLandingCms } from "@/lib/cms";

export async function GET() {
  try {
    const cms = getLandingCms();
    return NextResponse.json({ success: true, cms });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load landing CMS data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = updateLandingCms(body);
    return NextResponse.json({ success: true, cms: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update landing CMS data" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const reset = resetLandingCms();
    return NextResponse.json({ success: true, cms: reset });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to reset landing CMS data" },
      { status: 500 }
    );
  }
}
