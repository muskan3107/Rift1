import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Forward file to Python backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${backendUrl}/analyze`, {
      method: "POST",
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend analysis failed: ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
