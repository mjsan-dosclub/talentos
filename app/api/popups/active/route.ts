import { NextResponse } from "next/server";
import { getActivePopup } from "@/lib/popups";

export async function GET() {
  try {
    const popup = getActivePopup();
    return NextResponse.json({ success: true, popup });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to get active popup" },
      { status: 500 }
    );
  }
}
