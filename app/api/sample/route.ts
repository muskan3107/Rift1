import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Get backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Fetch sample CSV from public folder
    const sampleUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sample_data.csv`;
    const csvResponse = await fetch(sampleUrl);
    
    if (!csvResponse.ok) {
      throw new Error("Failed to fetch sample CSV");
    }

    const csvBlob = await csvResponse.blob();
    const csvFile = new File([csvBlob], "sample_data.csv", { type: "text/csv" });

    // Forward to Python backend
    const formData = new FormData();
    formData.append("file", csvFile);

    const response = await fetch(`${backendUrl}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend analysis failed: ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sample analysis error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Sample analysis failed"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    // Fetch sample CSV from public folder
    const sampleUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sample_data.csv`;
    const csvResponse = await fetch(sampleUrl);
    
    if (!csvResponse.ok) {
      throw new Error("Failed to fetch sample CSV");
    }

    const csvBlob = await csvResponse.blob();
    const csvFile = new File([csvBlob], "sample_data.csv", { type: "text/csv" });

    // Forward to Python backend
    const formData = new FormData();
    formData.append("file", csvFile);

    const response = await fetch(`${backendUrl}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend analysis failed: ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sample analysis error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Sample analysis failed"
      },
      { status: 500 }
    );
  }
}
