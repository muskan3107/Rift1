import { NextResponse } from "next/server";
import path from "path";
import { analyzeCsv } from "@/lib/pythonBridge";

export async function POST() {
  try {
    const samplePath = path.join(process.cwd(), "public", "sample_data.csv");
    const result = await analyzeCsv(samplePath);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sample analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sample analysis failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const samplePath = path.join(process.cwd(), "public", "sample_data.csv");
    const result = await analyzeCsv(samplePath);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sample analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sample analysis failed" },
      { status: 500 }
    );
  }
}
