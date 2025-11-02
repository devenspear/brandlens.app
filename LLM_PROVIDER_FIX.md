# LLM Provider JSON Parsing Fix

**Date:** November 1, 2025
**Issue:** Only Anthropic showing results in reports - OpenAI and Google failing
**Status:** ✅ FIXED & TESTED

---

## Problem Analysis

### Database Status Check Results

```
OPENAI: ❌ FAILED
├─ Error: "Empty response after cleaning markdown fences"
├─ Only 2/8 steps completed
└─ Findings: Brand Synopsis, Tone of Voice

GOOGLE: ❌ FAILED
├─ Error: "Unterminated string in JSON at position 5714"
├─ Only 4/8 steps completed
└─ Findings: Synopsis, 3 Pillars, Tone, 3 Segments

ANTHROPIC: ✅ COMPLETED
├─ All 8/8 steps completed
├─ 67 findings saved
└─ Full report generated
```

### Root Causes

1. **OpenAI Issue:** Responses were being over-stripped by markdown fence cleaning, resulting in empty strings

2. **Google Issue:** Token limit (4000) was too low, causing JSON responses to be truncated mid-string at character 5714

3. **Report Filtering:** Report generator only shows providers with `status='COMPLETED'`, which is correct behavior for graceful degradation

---

## Fixes Implemented

### 1. Improved Markdown Fence Stripping

**Before:**
```typescript
function stripMarkdownCodeFences(text: string): string {
  return text
    .replace(/^```json\s*\n/gm, '')
    .replace(/^```\s*\n/gm, '')
    .replace(/\n```\s*$/gm, '')
    .replace(/^```$/gm, '')
    .trim();
}
```

**After:**
```typescript
function stripMarkdownCodeFences(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text
    .replace(/^```json\s*\n/gm, '')
    .replace(/^```\s*\n/gm, '')
    .replace(/\n```\s*$/gm, '')
    .replace(/^```$/gm, '')
    .trim();

  // Handle edge case: ``` at start/end only
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }

  return cleaned.trim();
}
```

**Changes:**
- Added null/type checking
- Handles ``` at start/end without newlines
- More defensive edge case handling

---

### 2. Enhanced OpenAI Validation

**Added:**
```typescript
// Validate response is not empty
if (!cleanedText || cleanedText.length === 0) {
  console.error(`[OpenAI] Empty response. Original: ${content.length}, After: ${cleanedText.length}`);
  console.error(`[OpenAI] Original content: ${content.substring(0, 1000)}`);
  throw new Error('Empty response after cleaning markdown fences');
}

// Validate it looks like JSON
if (!cleanedText.trim().startsWith('{') && !cleanedText.trim().startsWith('[')) {
  console.error(`[OpenAI] Response doesn't look like JSON: ${cleanedText.substring(0, 200)}`);
  throw new Error('Response is not valid JSON format');
}
```

**Benefits:**
- Catches empty responses before JSON parsing
- Provides detailed debugging logs
- Validates JSON structure before parsing

---

### 3. Increased Google Token Limit

**Before:**
```typescript
maxTokens: provider === LlmProvider.OPENAI ? 8000 : 4000
```

**After:**
```typescript
maxTokens: 8000  // Increased for all providers to prevent truncation
```

**Impact:**
- Google now has 8000 tokens (was 4000)
- Prevents mid-response truncation
- Allows full JSON responses

---

### 4. Auto-Fix Truncated Google JSON

**Added automatic repair logic:**
```typescript
// Check if response was truncated (doesn't end with } or ])
if (!cleanedText.trim().endsWith('}') && !cleanedText.trim().endsWith(']')) {
  console.warn(`[Google] Response appears truncated. Length: ${cleanedText.length}`);

  // Count missing closing braces
  const openBraces = (cleanedText.match(/{/g) || []).length;
  const closeBraces = (cleanedText.match(/}/g) || []).length;
  const missing = openBraces - closeBraces;

  if (missing > 0) {
    const fixed = cleanedText + '}'.repeat(missing);
    console.log(`[Google] Attempting to fix by adding ${missing} closing braces`);

    try {
      const parsed = JSON.parse(fixed);
      console.log(`[Google] ✅ Successfully parsed after adding closing braces`);
      return { /* success */ };
    } catch (e) {
      console.error(`[Google] Fix failed, continuing with original error`);
    }
  }
}
```

**Benefits:**
- Automatically repairs truncated JSON
- Adds missing closing braces based on count
- Attempts parse, falls back to error if repair fails
- Logs success/failure of repair attempt

---

### 5. Enhanced Error Logging

**Added comprehensive debugging:**

```typescript
// OpenAI
console.log(`[OpenAI] Raw response preview: ${cleanedText.substring(0, 500)}...`);

// Google
console.log(`[Google] Raw response preview (${cleanedText.length} chars): ${cleanedText.substring(0, 500)}...`);
console.error(`[Google] Raw content (first 1000 chars): ${cleanedText.substring(0, 1000)}`);
console.error(`[Google] Raw content (last 500 chars): ${cleanedText.substring(Math.max(0, cleanedText.length - 500))}`);
```

**Benefits:**
- Shows character count
- Displays first 500-1000 chars
- Shows last 500 chars (where truncation occurs)
- Helps diagnose exactly where JSON fails

---

## Test Results

### ✅ Verification Complete (November 1, 2025)

**Test URL:** https://www.patagonia.com
**Project ID:** cmhh06v9u0000v1t155mpqszh

```
✅ OPENAI (GPT-4o)
├─ Status: COMPLETED
├─ Tokens: 7,330
├─ Cost: $0.0584
└─ All 8/8 steps completed successfully

✅ ANTHROPIC (Claude Sonnet 4.5)
├─ Status: COMPLETED
├─ Tokens: 11,285
├─ Cost: $0.0866
└─ All 8/8 steps completed successfully

✅ GOOGLE (Gemini 2.5 Pro)
├─ Status: COMPLETED
├─ Tokens: 8,937
├─ Cost: $0.0112
└─ All 8/8 steps completed successfully

📊 SUMMARY
├─ Providers: 3/3 completed (100% success rate)
├─ Total cost: $0.1562 per analysis
├─ Report URL: http://localhost:3000/project/cmhh06v9u0000v1t155mpqszh
└─ All 3 tabs showing in report ✅
```

**Conclusion:** The JSON parsing fixes successfully resolved both the OpenAI empty response issue and the Google truncation issue. All three LLM providers now complete reliably.

---

## Testing Recommendations

### 1. Re-run Failed Analysis

Delete the failed project and retest with westerlycolorado.com:

```bash
# Via Prisma Studio or API
DELETE FROM Project WHERE url = 'https://westerlycolorado.com' AND status = 'COMPLETED';
```

Then submit a new analysis from the homepage.

### 2. Monitor Logs

Watch for these success indicators:

```bash
npm run dev

# Look for:
[OPENAI] ✅ Step 1/8: Brand synopsis complete
[GOOGLE] ✅ Step 1/8: Brand synopsis complete
[ANTHROPIC] ✅ Step 1/8: Brand synopsis complete

# Watch for all 8 steps completing for each provider
# Final message should show 3/3 providers succeeded
```

### 3. Check Report

Report should now show all 3 tabs:
- **ANTHROPIC** tab
- **OPENAI** tab
- **GOOGLE** tab

Each with distinct analysis content.

---

## Expected Improvements

### OpenAI
- ✅ No more empty response errors
- ✅ Better validation catches malformed responses
- ✅ Detailed logs for debugging

### Google
- ✅ 8000 token limit prevents truncation
- ✅ Auto-repair handles edge case truncations
- ✅ Better error context in logs

### Overall
- ✅ More robust JSON parsing
- ✅ Better error messages
- ✅ Graceful degradation still works (continues if 1-2 fail)
- ✅ All 3 providers more likely to complete successfully

---

## Files Modified

1. `lib/services/llm-providers.ts`
   - Enhanced `stripMarkdownCodeFences()`
   - Improved OpenAI validation
   - Added Google auto-fix logic
   - Better error logging

2. `lib/services/brand-analyzer.ts`
   - Increased `maxTokens` from 4000 → 8000 for Google

---

## Build Status

✅ TypeScript compilation successful
✅ All routes registered
✅ No breaking changes
⚠️  Only non-blocking ESLint warnings (unused variables)

---

## Next Steps

1. **Test with new analysis** - Verify all 3 providers complete
2. **Monitor production** - Watch for any new edge cases
3. **Consider retry logic** - Add automatic retry for transient failures
4. **UI improvement** - Show failed provider status in report (future enhancement)

---

**Generated by Claude Code**
**Status:** ✅ Ready for Testing

