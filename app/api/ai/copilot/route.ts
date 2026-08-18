import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * AI Copilot API endpoint.
 *
 * Currently returns intelligent placeholder responses for agile project
 * management prompts. Ready to be swapped with Gemini, OpenAI, or any
 * LLM by replacing the `generateResponse` function body.
 *
 * Future integration:
 *   - import { GoogleGenerativeAI } from "@google/generative-ai";
 *   - const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
 */

const SYSTEM_PROMPT = `You are TasqX AI Copilot, an expert agile project management assistant.
You help teams with:
- Writing detailed user stories and acceptance criteria
- Breaking down features into actionable subtasks
- Estimating story points using the Fibonacci sequence
- Summarizing sprint progress and surfacing blockers
- Creating technical specifications and test plans

Always be concise, structured, and actionable. Format output with markdown when helpful.`;

async function generateResponse(userMessage: string): Promise<string> {
  // ── Placeholder intelligence until an LLM key is configured ────────────
  const lower = userMessage.toLowerCase();

  if (lower.includes("user story") || lower.includes("acceptance criteria")) {
    return `**User Story**\n\nAs a [role], I want to [action] so that [benefit].\n\n**Acceptance Criteria**\n- ✅ Given [context], when [action], then [expected result]\n- ✅ Given [context], when [action], then [expected result]\n- ✅ Given [context], when [action], then [expected result]\n\n*Ready to be refined by your team — let me know if you'd like me to tailor this to a specific feature!*`;
  }

  if (lower.includes("subtask") || lower.includes("break") || lower.includes("breakdown")) {
    return `**Suggested Subtasks**\n\n1. 🔍 Research & requirements analysis\n2. 🎨 UI/UX design & wireframes\n3. ⚙️ Backend API implementation\n4. 🖥️ Frontend component development\n5. 🧪 Unit & integration testing\n6. 📝 Documentation update\n7. 🚀 Code review & deployment\n\n*Estimated total: 8–13 story points. Want me to estimate each subtask individually?*`;
  }

  if (lower.includes("sprint") || lower.includes("summary") || lower.includes("status")) {
    return `**Sprint Summary**\n\n📊 **Progress**: On track\n✅ **Completed**: Items meeting acceptance criteria\n🔄 **In Progress**: Active development items\n⚠️ **Blockers**: Dependency on external service API response\n\n**Recommendations**:\n- Address the API dependency blocker by EOD\n- Consider carrying over 2 lower-priority items to next sprint\n- Schedule retrospective for Friday\n\n*Connect your sprint data for a real-time AI summary!*`;
  }

  if (lower.includes("estimate") || lower.includes("story point") || lower.includes("point")) {
    return `**Story Point Estimation**\n\nUsing the Fibonacci scale (1, 2, 3, 5, 8, 13, 21):\n\n| Complexity | Points | Examples |\n|---|---|---|\n| Trivial | 1 | Text copy change, styling tweak |\n| Small | 2 | Simple CRUD endpoint |\n| Medium | 3–5 | Feature with UI + API |\n| Large | 8 | Complex feature with integrations |\n| Epic | 13+ | Break this down further |\n\n*Based on your description, I'd estimate **5 points**. Share more details to refine this estimate!*`;
  }

  // Default response
  return `I'm ready to help with your project! Here are some things I can do:\n\n📝 **User Stories** — "Write a user story for login feature"\n🧩 **Task Breakdown** — "Break down the payment integration"\n📊 **Sprint Analysis** — "Summarize this sprint"\n⚡ **Estimation** — "Estimate story points for this feature"\n\nWhat would you like to work on?`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    // Future: add auth check here
    // const session = await getServerSession();
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const response = await generateResponse(message);

    return NextResponse.json({ response, model: "tasqx-copilot-v1" });
  } catch (error) {
    console.error("[AI Copilot] Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
