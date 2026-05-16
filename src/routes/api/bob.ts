import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

const SYSTEM_PROMPT = `You are BOB — Locci Box's senior code-review assistant.
You help engineers find bugs, security holes, performance issues, and style problems in code they paste.

How to respond:
- If the user pastes code (in any language), do a careful review.
- Group findings under: **Bugs**, **Security**, **Performance**, **Readability**, **Suggestions**.
- For every finding, quote the offending lines in a fenced code block, then explain the fix and show a corrected snippet in a separate fenced code block. Always set the language tag on fenced blocks.
- If you spot none in a category, omit it.
- Be concise. Skip preamble. Never apologise.
- If the user is just chatting (no code yet), invite them to paste a file or snippet.
- Markdown is rendered. Use bold sparingly for the section headers above.`;

export const Route = createFileRoute("/api/bob")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const auth = request.headers.get("authorization");
        if (!auth?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = auth.slice(7);

        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error: claimErr } = await supabase.auth.getClaims(token);
        if (claimErr || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }
        const userId = claims.claims.sub as string;

        const body = (await request.json()) as { messages?: UIMessage[]; threadId?: string };
        const messages = body.messages ?? [];
        const threadId = body.threadId;
        if (!threadId) return new Response("Missing threadId", { status: 400 });

        // Verify thread ownership
        const { data: thread } = await supabase
          .from("bob_threads")
          .select("id")
          .eq("id", threadId)
          .maybeSingle();
        if (!thread) return new Response("Thread not found", { status: 404 });

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(apiKey);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: convertToModelMessages(messages),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages,
          onFinish: async ({ messages: finalMessages }) => {
            // Persist any new messages we don't already have
            const newest = finalMessages.slice(-2); // user + assistant pair from this turn
            const rows = newest.map((m) => ({
              thread_id: threadId,
              user_id: userId,
              role: m.role,
              ui_message: m as unknown as Record<string, unknown>,
            }));
            const { error } = await supabase.from("bob_messages").insert(rows);
            if (error) console.error("[bob] save error", error);
          },
        });
      },
    },
  },
});
