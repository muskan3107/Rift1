# MuleRift - Quick Start Guide

## 🚀 Grok AI Integration Complete!

Your MuleRift fraud detection system now includes an AI-powered AML Investigation Assistant using Grok API.

## ⚙️ Setup (Required)

### 1. Add Your Grok API Key

Edit `.env.local` and replace the placeholder:

```env
GROK_API_KEY=xai-your-actual-api-key-here
```

**Get your API key**: https://x.ai/api

### 2. Restart the Server

After adding your API key:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎯 How to Use

### Step 1: Run Analysis
1. Open http://localhost:3000
2. Click "Run Sample Data" or upload your own CSV
3. Wait for analysis to complete

### Step 2: View Results
- You'll be redirected to the results page
- See summary statistics and fraud rings

### Step 3: Chat with AI Assistant
1. Click "Show AI Assistant" button (purple button, top right)
2. Chat sidebar appears on the right
3. Ask questions about the fraud detection results

## 💬 Example Questions

Try asking the AI assistant:

**Quick Questions** (pre-populated buttons):
- "Explain the highest risk accounts"
- "What criminal strategies were detected?"
- "Are there any false positives?"
- "Summarize the fraud rings"

**Custom Questions**:
- "Why is RING_001 flagged as suspicious?"
- "What does shell_layering mean?"
- "How confident are you in these detections?"
- "What should I investigate first?"
- "Explain the smurfing pattern in detail"
- "Are there any legitimate business patterns here?"

## 🕵️ AI Assistant Features

### Response Modes

**EXPLANATION MODE** (Default)
- Quick risk summary
- Key graph signals (cycles, velocity, net flow)
- Behavioral interpretation
- Confidence level

**ADVERSARY MODE**
- Criminal obfuscation strategies
- Detection breakthrough analysis
- How the graph caught the fraud

**FALSE POSITIVE MODE**
- Identifies benign patterns
- Justifies persistent risk flags
- Helps reduce false positives

### Context Awareness

The AI automatically receives:
- All suspicious accounts
- All fraud rings
- Summary statistics
- Pattern types (cycle, smurfing, shell_layering)
- Risk scores and suspicion scores

You don't need to provide account IDs or ring details - the AI already has them!

## 📊 Pattern Types Explained

The AI understands these fraud patterns:

**cycle**: Circular fund routing (A → B → C → A)
- Detected when funds flow in a circle
- All transactions within 72 hours
- High suspicion score

**smurfing**: Fan-in/Fan-out aggregation
- 10+ senders to 1 collector (Fan-In)
- 1 disperser to 10+ receivers (Fan-Out)
- Within 72-hour burst window
- Velocity ratio ≥ 0.7

**shell_layering**: Ghost account chains
- Accounts with ≤3 total transactions
- Funds pass through quickly (<24h)
- Strict amount decay at each hop
- Chain completes within 72 hours

## 🔒 Security

- API key stored in `.env.local` (not committed to git)
- Never exposed to client-side code
- Secure server-side API calls only

## 🧪 Testing the Integration

### Test 1: Basic Chat
1. Run sample analysis
2. Open AI Assistant
3. Click "Explain the highest risk accounts"
4. Verify you get a professional investigative response

### Test 2: Context Awareness
1. Ask: "What is the risk score of RING_001?"
2. AI should know without you providing details
3. Verify it references specific accounts

### Test 3: Pattern Explanation
1. Ask: "What does shell_layering mean?"
2. AI should explain the forensic criteria
3. Verify it relates to your specific results

## 🐛 Troubleshooting

### "Grok API key not configured"
- Check `.env.local` exists in project root
- Verify `GROK_API_KEY` is set correctly
- Restart the development server

### Chat button doesn't appear
- Clear browser cache
- Check browser console for errors
- Verify you're on the results page

### AI gives generic responses
- Ensure analysis results are in sessionStorage
- Try refreshing the results page
- Check that analysisContext is being passed

### API rate limit errors
- Grok API has usage limits
- Wait a few minutes between requests
- Consider upgrading your API plan

## 📈 Cost Estimation

Typical usage per analysis:
- System prompt: ~400 tokens
- Analysis context: ~500-2000 tokens
- User question: ~10-100 tokens
- AI response: ~200-1000 tokens

**Total per question**: ~1,000-3,500 tokens

Check Grok API pricing at: https://x.ai/api

## 🎨 UI Features

### Chat Interface
- Clean, professional design
- Real-time message streaming
- Loading indicators
- Scrollable message history
- Quick question buttons

### Responsive Layout
- Desktop: Sidebar on right (1/3 width)
- Mobile: Full-width overlay
- Sticky positioning
- Smooth animations

### Integration Points
- Results page: "Show AI Assistant" button
- Automatic context passing
- Session persistence
- Download chat history (coming soon)

## 🚀 Next Steps

### Recommended Workflow
1. Upload transaction CSV
2. Review summary statistics
3. Open AI Assistant
4. Ask: "Summarize the fraud rings"
5. For each high-risk ring, ask: "Explain RING_00X"
6. Ask: "What should I investigate first?"
7. Download JSON report
8. Export chat history (if needed)

### Advanced Usage
- Ask about specific accounts
- Request investigation priorities
- Query about false positive risks
- Get confidence assessments
- Understand criminal strategies

## 📚 Documentation

- **Full Integration Guide**: `GROK_INTEGRATION.md`
- **Shell Detection**: `SHELL_DETECTION_REFINEMENT.md`
- **Risk Scoring**: `RISK_SCORE_IMPLEMENTATION.md`
- **Smurfing Patterns**: `SMURFING_DETECTION_IMPLEMENTATION.md`

## ✅ Verification Checklist

Before using in production:

- [ ] Grok API key added to `.env.local`
- [ ] Server restarted after adding key
- [ ] Sample analysis runs successfully
- [ ] AI Assistant button appears on results page
- [ ] Chat interface opens when clicked
- [ ] AI responds to test questions
- [ ] Context is passed correctly (AI knows account details)
- [ ] Responses are professional and investigative
- [ ] No API errors in console

## 🎯 Success Criteria

You'll know it's working when:
- ✅ AI Assistant button is visible (purple)
- ✅ Chat sidebar opens smoothly
- ✅ AI greets you as an AML investigator
- ✅ Quick question buttons appear
- ✅ AI references specific rings and accounts
- ✅ Responses are professional and analytical
- ✅ No "API key not configured" errors

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify API key is valid at https://x.ai/api
4. Check server logs for detailed error messages

---

**Status**: ✅ Integration Complete

Your MuleRift system now has an AI-powered AML Investigation Assistant ready to help analysts understand fraud detection results and make informed decisions!

**Dashboard**: http://localhost:3000
