import Anthropic from "@anthropic-ai/sdk";
import { ChatMessage } from "./PromptBuilder";

const MODEL = "claude-3-5-haiku-20241022";
const MAX_TOKENS = 1024;

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    // API key is read from ANTHROPIC_API_KEY env var automatically
    this.client = new Anthropic();
  }

  /**
   * Send a message and get a complete response.
   * @param systemPrompt  The system prompt (DM persona + campaign context)
   * @param history       Prior messages in the conversation
   * @param userMessage   The current user message
   */
  async sendMessage(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    const messages: Anthropic.MessageParam[] = [
      // Map prior history
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      // The new user turn
      { role: "user" as const, content: userMessage },
    ];

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    });

    const block = response.content[0];
    if (block.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }
    return block.text;
  }

  /**
   * Send a message and return a Node.js-compatible async iterable stream of text chunks.
   * Use this for streaming responses to the client.
   */
  async *streamMessage(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string
  ): AsyncIterable<string> {
    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    const stream = await this.client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  }
}
