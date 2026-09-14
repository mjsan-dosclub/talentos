import { NextResponse } from "next/server";
import { getCaseStudies, getCaseStudyBySlug, addCaseStudy } from "@/lib/casestudies";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
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
    const slug = searchParams.get("slug");
    const category = searchParams.get("category");

    if (slug) {
      const study = getCaseStudyBySlug(slug);
      if (!study) {
        return NextResponse.json(
          { success: false, error: "Case study not found" },
          { status: 404, headers: CORS_HEADERS }
        );
      }
      return NextResponse.json(
        { success: true, casestudy: study },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const items = getCaseStudies(category || undefined);
    return NextResponse.json(
      {
        success: true,
        source: "TalentOS by DeScience Open Source Club",
        endpoint: "/api/casestudies",
        count: items.length,
        casestudies: items,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve case studies" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title || !body.student || !body.summary) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, student, summary)" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const created = addCaseStudy(body);
    return NextResponse.json(
      { success: true, casestudy: created },
      { status: 201, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create case study" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
