# Agent Fundamentals

## Chatbot vs Agent

The clearest way to understand the distinction is to ask a single question: **who drives the loop?** In a chatbot, the human is always in the seat — every response requires a new human message to continue. In an agent, the human pulls a trigger and then steps back.

```flow
Chatbot | [n]Human > [a]LLM > [n]Human > [a]LLM > [n]Human …
Agent   | [n]Human triggers > [a]LLM > [g]Tool > [a]LLM > [g]Tool > [n]Result
---
A chatbot routes messages. An agent runs autonomously between trigger and result.
```

## The Agent Loop

The process is the agent. The LLM is a stateless reasoning engine the process calls. Each call is a pulse — the LLM responds, the agent acts on that response, and the loop continues until the task is done.

> The LLM has no idea it's in a loop. It only sees the current context window and responds.

```steps
01 | Human triggers | A user message, scheduled event, or external signal starts the loop.
02 | Build context window | Agent assembles system prompt, history, tool results, and loaded memory into a full payload.
03 | Call LLM | Agent sends the full context as an HTTP POST. The LLM sees only this snapshot — nothing else.
04a | LLM outputs tool instruction → Agent executes | LLM writes a tool-use instruction as text. Agent reads it, runs the tool, appends result to context, loops back to step 02.
04b | LLM signals done → Return to human | Loop ends. Final response returned. The LLM had no idea it was in a loop.
```

An important precision: the LLM doesn't *call* tools. It outputs text that looks like a tool-use instruction. The **agent process** reads that output and decides to execute it.

## Context Window = Agent's Entire Reality

Everything the agent knows at any moment lives in the context window. There is no other memory. Nothing persists between calls except what the agent process explicitly reconstructs and includes.

| What it feels like   | What it actually is              |
|----------------------|----------------------------------|
| Memory (CLAUDE.md)   | Text loaded into context         |
| Tool results         | Observations appended to context |
| Instructions         | Text at the top of context       |
| Conversation history | Prior turns in context           |

## The Agent Spectrum

Agents aren't binary — it's a spectrum defined by **autonomy depth**: how many reasoning-action cycles run before a human sees anything.

```spectrum
Chatbot | Claude.ai plain chat | Human every turn
Tool-assisted | Claude.ai with tools | Every turn, sees tool calls
Supervised | Claude Code (watched) | Triggered + monitoring
Autonomous | Claude Code in CI | Triggered, result only
---
← less autonomy | autonomy depth →
```

## Key Takeaways

- **The agent is the process** — not the LLM. The LLM is a stateless reasoning engine the process calls.
- **LLMs don't call tools** — they output tool-use instructions as text. The agent process executes them.
- **LLM is stateless** — it only knows what's in the current context window. No memory between calls.
- **Agents reason in pulses** — infer → act → observe → repeat.
- **Autonomy depth** is what separates an agent from a chatbot.
