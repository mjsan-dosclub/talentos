import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export interface TalentosAdminUser {
  id: string;
  name: string;
  email: string;
  custom_role_name: string;
  allowed_modules: string[];
  is_super_admin: boolean;
  is_active: boolean;
  force_password_change?: boolean;
  temporary_password?: string;
  created_at: string;
  created_by?: string;
}

// In-memory backing store for admin user management with initial default Super Admin
let MASTER_ADMINS_LEDGER: TalentosAdminUser[] = [
  {
    id: "s0000001-0000-0000-0000-000000000001",
    name: "SUPER ADMIN",
    email: "admin@dosclub.org",
    custom_role_name: "Super Administrator",
    allowed_modules: ["all"],
    is_super_admin: true,
    is_active: true,
    force_password_change: false,
    created_at: "2026-01-01T00:00:00Z",
  },
];

import { loadAdminsFromDisk, saveAdminsToDisk } from "@/lib/admins-store";

export async function GET(req: NextRequest) {
  const diskAdmins = loadAdminsFromDisk();
  try {
    const { data, error } = await supabaseAdmin.from("admin_users").select("*");
    if (!error && data && Array.isArray(data)) {
      // Merge DB records with disk ledger (deduplicating by email)
      const combinedMap = new Map<string, TalentosAdminUser>();
      diskAdmins.forEach((item) => combinedMap.set(item.email.toLowerCase(), item));
      data.forEach((item: TalentosAdminUser) => combinedMap.set(item.email.toLowerCase(), item));
      const result = Array.from(combinedMap.values());
      saveAdminsToDisk(result);
      return NextResponse.json({ success: true, admins: result });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ success: true, admins: diskAdmins });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, custom_role_name, allowed_modules, password, force_password_change, created_by } = body;

    if (!name || !email || !custom_role_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (name, email, custom_role_name)" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    if (MASTER_ADMINS_LEDGER.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return NextResponse.json(
        { success: false, error: `An admin account with email "${cleanEmail}" already exists.` },
        { status: 409 }
      );
    }

    const newAdmin: TalentosAdminUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: cleanEmail,
      custom_role_name: custom_role_name.trim(),
      allowed_modules: allowed_modules || ["workshops", "students"],
      is_super_admin: false,
      is_active: true,
      force_password_change: force_password_change !== undefined ? Boolean(force_password_change) : true,
      temporary_password: password?.trim() || "admin@2026",
      created_at: new Date().toISOString(),
      created_by: created_by || "admin@dosclub.org",
    };

    MASTER_ADMINS_LEDGER.push(newAdmin);
    const diskAdmins = loadAdminsFromDisk();
    diskAdmins.push(newAdmin);
    saveAdminsToDisk(diskAdmins);

    // Persist to Supabase
    try {
      await supabaseAdmin.from("admin_users").insert([newAdmin]);
    } catch {
      // non-blocking
    }

    // Audit Log
    try {
      await supabaseAdmin.from("audit_logs").insert([
        {
          id: crypto.randomUUID(),
          actor_id: created_by || "admin@dosclub.org",
          actor_role: "SUPER_ADMIN",
          entity_name: "admin_users",
          entity_id: newAdmin.id,
          action: "ADMIN_USER_CREATED",
          new_state: newAdmin,
          reason: `Created additional admin user ${newAdmin.name} (${newAdmin.custom_role_name})`,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // non-blocking
    }

    return NextResponse.json({ success: true, admin: newAdmin }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create admin user" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_active, allowed_modules, custom_role_name, name } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Admin id is required" }, { status: 400 });
    }

    const target = MASTER_ADMINS_LEDGER.find((a) => a.id === id || a.email.toLowerCase() === id.toLowerCase());
    if (!target) {
      return NextResponse.json({ success: false, error: "Admin user not found" }, { status: 404 });
    }

    // Rule: System must prevent deletion or deactivation of the final Super Admin
    if (target.is_super_admin && is_active === false) {
      const activeSuperAdmins = MASTER_ADMINS_LEDGER.filter((a) => a.is_super_admin && a.is_active);
      if (activeSuperAdmins.length <= 1) {
        return NextResponse.json(
          { success: false, error: "Security Policy Violation: The primary/final Super Admin cannot be deactivated." },
          { status: 403 }
        );
      }
    }

    if (name !== undefined) target.name = name;
    if (custom_role_name !== undefined) target.custom_role_name = custom_role_name;
    if (allowed_modules !== undefined) target.allowed_modules = allowed_modules;
    if (is_active !== undefined) target.is_active = is_active;

    try {
      await supabaseAdmin.from("admin_users").update(target).eq("id", target.id);
    } catch {
      // non-blocking
    }

    return NextResponse.json({ success: true, admin: target });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update admin user" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Admin id is required for deletion" }, { status: 400 });
    }

    const target = MASTER_ADMINS_LEDGER.find((a) => a.id === id || a.email.toLowerCase() === id.toLowerCase());
    if (!target) {
      return NextResponse.json({ success: false, error: "Admin user not found" }, { status: 404 });
    }

    // Rule: Cannot delete Super Admin
    if (target.is_super_admin) {
      return NextResponse.json(
        { success: false, error: "Security Policy Violation: Super Admin users cannot be deleted." },
        { status: 403 }
      );
    }

    MASTER_ADMINS_LEDGER = MASTER_ADMINS_LEDGER.filter((a) => a.id !== target.id);

    try {
      await supabaseAdmin.from("admin_users").delete().eq("id", target.id);
    } catch {
      // non-blocking
    }

    return NextResponse.json({ success: true, message: `Successfully deleted admin ${target.email}` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete admin user" },
      { status: 500 }
    );
  }
}
