import { NextRequest, NextResponse } from "next/server";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const INVESTIGATOR_SYSTEM_PROMPT = `# Role: AI Financial Crime Investigation Assistant
# Context: Integrated Graph-Based Money Muling Detection

You are a Senior AML Investigator analyzing MuleRift fraud detection results.

## Response Modes:

### EXPLANATION MODE (Default)
- Quick Summary: High-level risk assessment
- Key Signals: Direct evidence from graph metrics (net flow, cycles, velocity)
- Interpretation: Translate technical signals to muling behavior
- Confidence: Level of certainty (High/Medium/Low)

### ADVERSARY MODE (When asked about criminal strategy)
- Criminal Strategy: Describe the likely obfuscation (e.g., "Structuring," "Smurfing")
- Detection Breakthrough: Explain which graph signal (temporal/structural) caught them

### FALSE POSITIVE MODE (When questioning legitimacy)
- Identify benign patterns (e.g., payroll, merchant behavior)
- State why the risk flag persists despite benign signals

## Behavior Rules:
- SEPARATE facts from interpretation
- Use professional, analytical, and calm investigator-like tone
- If data is missing, state: "Insufficient context provided for confirmation"
- Provide actionable insights for compliance teams

Pattern Types:
- "cycle": Circular fund routing
- "smurfing": Fan-in/Fan-out aggregation (10+ senders/receivers in 72h)
- "shell_layering": Ghost accounts with <3 transactions, passing funds quickly (<24h)

Always interpret suspicion_score and risk_score as fraud indicators (0-100 scale).`;

export async function POST(request: NextRequest) {
  try {
    const { message, analysisContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "Groq API key not configured. Please add GROQ_API_KEY to .env.local" },
        { status: 500 }
      );
    }
    
    console.log("API Key loaded:", apiKey ? "✓ Present" : "✗ Missing");

    // Build context-aware message
    let contextMessage = message;
    if (analysisContext) {
      const contextString = JSON.stringify(analysisContext, null, 2);
      contextMessage = `Analysis Context:\n${contextString}\n\nUser Question: ${message}`;
      console.log("Context passed to API:", contextString.substring(0, 200) + "...");
    } else {
      console.log("No analysis context provided");
    }

    console.log("Calling Groq API with model: llama-3.3-70b-versatile");

    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: INVESTIGATOR_SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: contextMessage,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      console.log("Groq API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API error response:", errorText);
        console.error("Status code:", response.status);
        
        if (response.status === 401) {
          return NextResponse.json(
            { error: "Unauthorized: Invalid Groq API key. Please check your GROQ_API_KEY in .env.local" },
            { status: 401 }
          );
        } else if (response.status === 404) {
          return NextResponse.json(
            { error: "Not Found: Invalid model or endpoint. Using model: llama-3.3-70b-versatile" },
            { status: 404 }
          );
        } else {
          return NextResponse.json(
            { error: `Groq API error (${response.status}): ${errorText}` },
            { status: response.status }
          );
        }
      }

      const data = await response.json();
      console.log("Groq API response received successfully");
      
      const assistantMessage = data.choices?.[0]?.message?.content || "No response generated";

      return NextResponse.json({
        message: assistantMessage,
        usage: data.usage,
      });
    } catch (fetchError) {
      console.error("Fetch error calling Groq API:", fetchError);
      return NextResponse.json(
        { error: `Network error: ${fetchError instanceof Error ? fetchError.message : "Unknown error"}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
