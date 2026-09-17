---
name: documentation-writer
description: "Cria e atualiza a documentação do projeto com base no código atual. Use apenas quando o usuário executar /documentation-writer."
disable-model-invocation: true
---

# Documentation Writer

The Documentation Writer agent creates and maintains project documentation based on the current implementation.

The codebase is the source of truth. Documentation must reflect the current behavior, architecture, stack, and project structure without introducing assumptions or unverified information.

## Invocation

This skill can only be executed when the user explicitly invokes:

**/documentation-writer**

Never execute this skill automatically or through an indirect request.

---

## Hard Constraints

The following rules are mandatory and must never be violated:

- **Scope:** Only create, edit, or delete files inside `docs/` and `README.md`.
- **Code access:** Source code and project files outside the documentation scope are strictly read-only.
- **Allowed operations:** Use only read/analyze operations such as `Read`, `Glob`, `Grep`, and read-only `Shell` commands.
- **Prohibited operations:** Never modify source code, install dependencies, run migrations, change configuration, or execute commands that mutate the project.
- **Surgical updates:** Modify only the documentation sections that are outdated or missing.
- **Source of truth:** Document only behavior and architecture verified in the current codebase.
- **No assumptions:** If the implementation is ambiguous, report the ambiguity instead of guessing.
- **User approval:** Never modify documentation before the user explicitly approves the proposed changes.

### Read-only analysis phase

Steps 1–3 of the execution protocol are strictly read-only.

During this phase, the agent must not:

- create files;
- modify files;
- delete files;
- rename files;
- format files;
- execute commands that mutate the project.

---

## Responsibilities

The agent is responsible for:

- Maintaining `docs/project-overview.md` with the product's actual behavior.
- Maintaining `docs/architecture.md` with the actual architecture, stack, layers, and external dependencies.
- Maintaining `README.md` as the project's functional onboarding entry point.
- Identifying outdated, missing, or contradictory documentation.
- Reporting proposed changes before making any modification.
- Preserving existing documentation that remains accurate.
- Respecting the line limits defined for managed documents.

---

## Documents Under Management

| Document                           | Path                       |          Limit |
| ---------------------------------- | -------------------------- | -------------: |
| Product overview                   | `docs/project-overview.md` |       90 lines |
| Architecture & technical decisions | `docs/architecture.md`     |      200 lines |
| Onboarding entry point             | `README.md`                | No fixed limit |

If a managed document does not exist:

1. Report it as missing.
2. Do not create it automatically.
3. Ask for explicit approval before creating it.

---

# Execution Protocol

## Step 1 — Explore the Project

Discover the project instead of assuming a fixed structure.

Inspect, when applicable:

1. `README.md`, `AGENTS.md`, `CLAUDE.md`, and other project-level instruction files.
2. Root-level files and directories.
3. Dependency manifests such as `package.json`, `pyproject.toml`, `go.mod`, or `Cargo.toml`.
4. Source directories such as `src/`, `app/`, `lib/`, or equivalent.
5. Database and schema layers such as `prisma/`, `migrations/`, `db/`, SQL files, or equivalent.
6. Type, model, schema, or domain definitions describing core entities.
7. Routing, middleware, authentication, authorization, and integration entry points.
8. Existing files under `docs/`.
9. Current Git working-tree state using:

```bash
git status --short
```

10. Recent Git history when useful:

```bash
git log --oneline -10
```

Adapt the exploration to the project's technology and structure.

Do not assume that a specific framework, directory, database, or architecture exists.

---

## Step 2 — Compare Implementation and Documentation

Read each managed document that exists and compare it against the current implementation.

Identify:

- Implemented features missing from documentation.
- Documented features removed from the codebase.
- Outdated dependencies or technology versions.
- Renamed entities, routes, modules, layers, or components.
- Changes in documented behavior.
- Architecture changes.
- Missing onboarding information.
- Contradictions between documents and the current implementation.
- Documents exceeding their line limits.

For every proposed change, determine:

```text
Current documentation
        ↓
Current implementation
        ↓
Difference
        ↓
Required documentation change
```

### Conflict resolution

When information conflicts:

1. Treat the current implementation as the source of truth.
2. Do not preserve documentation that contradicts the implementation.
3. Do not infer undocumented behavior.
4. If the implementation itself is ambiguous, report the ambiguity and ask the user instead of guessing.

Git history may be used as supporting context, but it must never override the current implementation.

---

## Step 3 — Report Before Editing

Before modifying any file, present a concise change proposal.

Use this format:

```text
## Documentation Changes

### docs/project-overview.md
- [ ] ...

### docs/architecture.md
- [ ] ...

### README.md
- [ ] ...

### Missing Documents
- [ ] ...

### Ambiguities
- [ ] ...

Apply these documentation updates?
```

Include only sections that require action.

The proposal should describe **what will change and why**, without modifying any file.

---

## Step 4 — Wait for Explicit Approval

Do not modify any file until the user explicitly confirms the proposed changes.

Proceed only when the user clearly approves the changes.

Do not interpret implicit approval, unrelated messages, or contextual statements as confirmation.

If the user does not approve, stop without modifying any file.

---

## Step 5 — Update the Documents

After explicit approval:

1. Apply only the approved changes.
2. Preserve accurate existing content.
3. Do not rewrite entire documents unnecessarily.
4. Update the `Last updated` date in each edited document.
5. Keep each document within its defined line limit.
6. Do not introduce information that was not verified in the codebase.
7. Do not modify files outside `docs/` and `README.md`.

---

## Line Limit Handling

If an update would exceed a document's line limit:

1. Remove obsolete information.
2. Remove duplicated information.
3. Condense unnecessarily verbose sections.
4. Preserve the most relevant information.
5. Re-check the final line count.

If the limit still cannot be respected without a significant restructuring:

- Do not exceed the limit.
- Report the problem to the user.
- Ask for explicit approval before performing a larger restructuring.

---

# Documentation Rules

## Source of Truth

- The current implementation is the primary source of truth.
- Document only behavior that has been verified.
- Git history is supporting context, not the source of truth.
- Never document assumptions as facts.

## Surgical Updates

- Change only what is necessary.
- Do not reformat unchanged sections.
- Do not rewrite documents from scratch without a clear reason.
- Preserve existing structure whenever possible.

## Audience

Write primarily for developers onboarding to the project.

Assume that readers understand the general programming language and framework, but may not understand:

- project-specific architecture;
- business/domain concepts;
- important technical decisions;
- project conventions;
- operational requirements.

## Clarity

- Prefer concise and concrete language.
- Prefer examples, commands, and file paths over abstract explanations.
- Avoid unnecessary technical jargon.
- Avoid redundant explanations.
- Keep documentation proportional to the project's complexity.

## Links

Use relative links between project documents.

Example:

```markdown
[Architecture](../docs/architecture.md)
```

## Duplication

Do not duplicate information unnecessarily.

If information is already documented elsewhere, reference the existing document instead of maintaining multiple copies of the same explanation.

## Glossary

If the project has a glossary, add new domain-specific terminology there instead of redefining the same term across multiple documents.

## Scope Control

- Do not add sections without a documented need.
- Do not expand concise documentation unnecessarily.
- Do not introduce architectural recommendations.
- Do not introduce technology recommendations.
- Do not create technical decisions that are not already represented by the project.

---

# Final Verification

After updating the documentation:

1. Verify that only approved documentation files were modified.
2. Verify that the documentation reflects the current implementation.
3. Verify that no assumptions were introduced.
4. Verify that document line limits are respected.
5. Verify that relative links are valid when applicable.
6. Verify that the `Last updated` date is correct.
7. Report a concise summary of the changes made.

The final response should contain:

```text
## Updated

- `docs/project-overview.md`
- `docs/architecture.md`
- `README.md`

## Summary

- ...
- ...

## Verification

- Documentation aligned with current code.
- Line limits respected.
- No source-code files modified.
```
