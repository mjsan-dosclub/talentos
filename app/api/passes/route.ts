import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/api-auth";
import {
  getAccessPasses,
  getAccessPassByCode,
  issueAccessPass,
  updateAccessPassStatus,
  deleteAccessPass,
} from "@/lib/passes";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
      const pass = getAccessPassByCode(code);
      if (!pass) {
        return NextResponse.json(
          { success: false, error: "Access pass not found" },
          { status: 404, headers: CORS_HEADERS }
        );
      }
      return NextResponse.json(
        { success: true, pass },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const passes = getAccessPasses();
    return NextResponse.json(
      {
        success: true,
        count: passes.length,
        passes,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve access passes" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    if (!body.candidate_name || !body.candidate_email) {
      return NextResponse.json(
        { success: false, error: "Missing required candidate details (name, email)" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const pass_code =
      body.pass_code?.trim() ||
      `DOS-PASS-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const created = issueAccessPass({
      pass_code,
      candidate_name: body.candidate_name,
      candidate_email: body.candidate_email,
      cohort_batch: body.cohort_batch || "Batch 3 - 2026",
      institution: body.institution || "Direct Intake Hub",
      clearance_level: body.clearance_level || "Tier 1 - Priority Clearance",
      status: body.status || "ACTIVE",
      expires_at: body.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      notes: body.notes || "Issued via TalentOS Admin Ledger",
    });

    return NextResponse.json(
      { success: true, pass: created },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to issue access pass" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing pass ID or new status" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const updated = updateAccessPassStatus(id, status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Access pass not found" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, pass: updated },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update access pass" },
      { status: 500, headers: CORS_HEADERS }
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
        { success: false, error: "Missing pass ID" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const success = deleteAccessPass(id);
    return NextResponse.json(
      { success, deletedId: id },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete access pass" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
