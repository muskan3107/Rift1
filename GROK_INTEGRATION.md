# Grok AI Integration - AML Investigation Assistant

## Overview
Integrated Grok API (xAI) as an AI-powered AML Investigation Assistant to help analysts understand fraud detection results and provide investigative guidance.

## Features

### 1. Senior AML Investigator Persona
The chatbot acts as a Senior AML Investigator with three response modes:

**EXPLANATION MODE (Default)**
- Quick risk summary
- Key graph signals (net flow, cycles, velocity)
- Behavioral interpretation
- Confidence level assessment

**ADVERSARY MODE**
- Criminal obfuscation strategies
- Detection breakthrough analysis
- Explains how graph signals caught the fraud

**FALSE POSITIVE MODE**
- Identifies benign patterns
- Justifies persistent risk flags
- Helps reduce false positives

### 2. Context-Aware Analysis
- Automatically receives full analysis results
- Understands pattern types: cycle, smurfing, shell_layering
- Interprets suspicion_score and risk_score (0-100 scale)
- References specific accounts and rings

### 3. Professional Investigative Tone
- Separates facts from interpretation
- Uses analytical, calm language
- Provides actionable insights
- States data limitations clearly

## Implementation

### Files Created

**1. API Route**: `app/api/chat/route.ts`
- Handles Grok API communication
- Includes investigator system prompt
- Passes analysis context automatically

**2. Chat Component**: `components/ChatInterface.tsx`
- Clean, professional UI
- Quick question buttons
- Real-time streaming responses
- Sticky sidebar on results page

**3. Environment Config**: `.env.local`
- Secure API key storage
- Not committed to git

### Integration Points

**Results Page** (`app/results/page.tsx`)
- "Show AI Assistant" button
- Sidebar chat interface
- Full analysis context passed automatically
- Responsive grid layout

## Setup Instructions

### 1. Get Grok API Key
1. Visit https://x.ai/api
2. Sign up for API access
3. Generate your API key

### 2. Configure Environment
Edit `.env.local`:
```env
GROK_API_KEY=your_actual_grok_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Restart Development Server
```bash
npm run dev
```

## Usage

### On Results Page
1. Click "Show AI Assistant" button
2. Chat interface appears in sidebar
3. Ask questions about the analysis

### Example Questions
- "Explain the highest risk accounts"
- "What criminal strategies were detected?"
- "Are there any false positives?"
- "Summarize the fraud rings"
- "Why is RING_001 flagged as suspicious?"
- "What does shell_layering mean?"

### Quick Questions
Pre-populated buttons for common queries:
- Explain the highest risk accounts
- What criminal strategies were detected?
- Are there any false positives?
- Summarize the fraud rings

## API Details

### Endpoint
`POST /api/chat`

### Request Body
```json
{
  "message": "User question",
  "analysisContext": {
    "suspicious_accounts": [...],
    "fraud_rings": [...],
    "summary": {...}
  }
}
```

### Response
```json
{
  "message": "AI assistant response",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 200,
    "total_tokens": 350
  }
}
```

### Grok API Configuration
- **Model**: `grok-beta`
- **Temperature**: 0.7 (balanced creativity/accuracy)
- **Max Tokens**: 1000 (detailed responses)
- **Endpoint**: `https://api.x.ai/v1/chat/completions`

## System Prompt

The assistant is configured with a comprehensive system prompt that:
- Defines the AML investigator role
- Explains response modes
- Provides pattern type definitions
- Sets behavioral rules
- Ensures professional tone

## Security

### API Key Protection
- Stored in `.env.local` (not committed)
- Accessed via `process.env.GROK_API_KEY`
- Never exposed to client-side code

### Error Handling
- Graceful fallback messages
- API error logging
- User-friendly error messages

## Cost Considerations

### Token Usage
- System prompt: ~400 tokens
- Analysis context: ~500-2000 tokens (varies by dataset)
- User message: ~10-100 tokens
- Response: ~200-1000 tokens

### Optimization
- Context is only sent when needed
- Responses capped at 1000 tokens
- Efficient prompt engineering

## Testing

### Test the Integration
1. Run sample analysis: `POST /api/sample`
2. View results page
3. Click "Show AI Assistant"
4. Ask: "Explain the fraud rings"

### Expected Behavior
- Assistant provides professional analysis
- References specific accounts and rings
- Explains pattern types clearly
- Offers investigative insights

## Troubleshooting

### "Grok API key not configured"
- Check `.env.local` exists
- Verify `GROK_API_KEY` is set
- Restart development server

### "Failed to get response from Grok API"
- Verify API key is valid
- Check internet connection
- Review API rate limits

### Chat not appearing
- Check browser console for errors
- Verify component import in results page
- Clear browser cache

## Future Enhancements

### Potential Features
- [ ] Export chat history
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Custom investigation templates
- [ ] Integration with case management
- [ ] Automated report generation

## Documentation

### Pattern Types Explained to Users
- **cycle**: Circular fund routing (A → B → C → A)
- **smurfing**: Fan-in/Fan-out (10+ senders/receivers in 72h)
- **shell_layering**: Ghost accounts (<3 txns, fast pass-through <24h)

### Score Interpretation
- **suspicion_score**: Individual account risk (0-100)
- **risk_score**: Ring-level risk (average of member scores)
- **Thresholds**: >70 = High, 50-70 = Medium, <50 = Low

## Credits

- **AI Model**: Grok by xAI
- **Integration**: MuleRift Team
- **Persona Design**: Senior AML Investigator archetype
- **UI Framework**: Next.js 14 + Tailwind CSS

---

**Status**: ✅ Fully Integrated and Operational

The Grok AI assistant is now available on the results page to help analysts understand fraud detection findings and make informed investigative decisions.
