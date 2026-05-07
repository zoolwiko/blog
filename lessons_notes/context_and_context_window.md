# Context & Context Window

## What is Context?

Every LLM call is a fresh HTTP request. There is no persistent connection. No session. The agent reconstructs the full context and sends it every single time. **The LLM has no memory between calls — the agent process owns continuity.**

```flow
[a]Agent Process > [n]Reconstructs context > [n]JSON payload > [b]HTTP POST > [g]LLM API > [a]Response → Agent
---
No persistent connection. No session. The LLM is stateless.
```

## Structure of a Context Payload

Sent as JSON over HTTP on every call. Images, PDFs, and documents are embedded as base64 blocks. Tool results are special message types — not plain conversation turns.

```json
{
  "model": "claude-sonnet-...",
  "system": "You are... [developer instructions]",
  "messages": [
    { "role": "user",      "content": "Do X" },
    { "role": "assistant", "content": "...[reasoning + tool call]..." },
    { "role": "user",      "content": "[tool result: ...]" }
  ]
}
```

## System Prompt

The system prompt is written by the **agent developer**, loaded before any conversation begins, and never shown to the user. It contains the agent's identity, core instructions, tool definitions, safety rules, and behavioural constraints.

```callout red
**Prompt Injection** — a real attack vector where malicious content inside a tool result (e.g. a webpage the agent read) tries to override or hijack system prompt authority. Enforcement must be architectural, not just instructional.
```

## Context Management Strategies

Agents can't grow context forever — there's a hard token limit. Developers choose how to manage it. Most real agents combine several strategies.

| Strategy               | How it works                                                | Trade-off                                  |
|------------------------|-------------------------------------------------------------|--------------------------------------------|
| **Always include**     | Static content always in context (CLAUDE.md, system prompt) | <span class="bdg a">Takes up space</span> but always available |
| **Sliding window**     | Keep last N turns, drop older ones                          | <span class="bdg g">Simple</span> but loses history |
| **Summarisation**      | Compress old history into a paragraph via LLM call          | <span class="bdg g">Space-efficient</span> but lossy |
| **RAG**                | Fetch relevant chunks from external storage on demand       | <span class="bdg g">Scalable</span> but adds latency |
| **Tool result pruning**| Summarise large tool outputs before adding to context       | <span class="bdg g">Prevents bloat</span> from verbose tools |

```callout amber
**Who decides?** The developer — baked into the architecture, not decided at runtime. Claude Code uses token-budget-aware logic: when context approaches its limit, a summarisation pass compresses history to free space.
```

## Performance & Design Choices

```cards
[at]Context size affects performance | Larger context → more tokens → longer time to first token. Not always linear, but the relationship is real.
[bt]Why not WebSockets? | Statelessness is in the model, not the transport layer. Full context still gets rebuilt and sent each call regardless of connection type.
[gt]Why JSON? | Convention, universal tooling, human-readability — critical for debugging. The bottleneck is inference time, not serialization.
[at]Developer controls everything | Fixed token budget, turn count limits, importance scoring — all developer decisions baked into architecture. Not runtime decisions.
```

## Key Takeaways

- **Every LLM call is stateless** — the agent rebuilds full context from scratch each time.
- **The system prompt** is developer-authored and invisible to the user — it defines rules and identity.
- **Tool results are not plain chat turns** — they are special message types in the payload.
- **Context has a hard token limit** — management is not optional, it's a core design problem.
- **Larger context = slower inference** — context management matters beyond just hitting limits.
- **Prompt injection is a real threat** — requires architectural enforcement.
