# Theosis Studio V0 — operator runbook

**A conversational production desk, not a board or a new website.**

1. Open the existing private chat (ChatGPT or other connected client). Read `CHAT-CONTRACT.md`. Ask an editorial question, not a multiagent task.
2. Explore sources and the most uncomfortable counterargument. The corpus is never a substitute for public evidence. If a real private graph is present locally, run:
   ```bash
   python3 tools/theosis-studio/graph_context.py "ricordo di sé"
   python3 -m unittest discover -s tools/theosis-studio/tests -v
   ```
   The output is PRIVATE. Do not auto-export it into commercial prompts or Git.
3. Read `first-release/THE-DIVIDED-WILL.md` and `first-release/EVIDENCE.md`. Discuss modifications with the author.
4. Open `first-release/experience.html` locally. It is a standalone responsive prototype, no database, no collection of personal data, no purchase.
5. Make one author-reviewed new public artifact based on verified, publishable sources. Only then request explicit permission for Instagram publishing, pricing, Stripe checkout or deploy.
6. Measure real interaction and purchases. Commercial decision is not made from follower counts or fictional conversion data.

## V0 deliberately does NOT do
- Does not turn the Theosis private knowledge graph into public RAG.
- Does not claim an LLM has interviewed the author's actual private pages (the graph SQLite is gitignored).
- Does not create a CEO board, agent framework, scheduler or another control plane.
- Does not register a social account, create product price, collect money, send DMs or publish automatically.
- Does not alter `NEXT.md` / R1, `AGENTS.md` or Theosis governance.

## Exit gate for this slice
A credible English reel + carousel + free interactive pathway share an evidence map, with clear editorial status and a privacy boundary. Business launch is a separate approved action.