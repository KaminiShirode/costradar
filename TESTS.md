# TESTS

## How to Run

```bash
npm run test
```

Or to run with watch mode during development:
```bash
npx vitest
```

All tests are pure TypeScript — no environment variables required. The audit engine has no external dependencies.

---

## Test File: `__tests__/auditEngine.test.ts`

Run individual file: `npx vitest run __tests__/auditEngine.test.ts`

### Overkill detection

| Test | What it covers |
|---|---|
| Flags Enterprise plan for 5-person team | `isOverkill()` — Enterprise threshold when teamSize ≤ 10 |
| Flags Team plan for single user | `isOverkill()` — Team plan with 1 seat |
| Flags Business plan for single Cursor user | `isOverkill()` — Business plan with 1 seat |

### Optimal plan detection

| Test | What it covers |
|---|---|
| Marks GitHub Copilot Individual for solo dev as optimal | No false positives — correctly priced plan stays optimal |
| Marks Claude Pro for solo writer as optimal | Use-case match — writing team + general tool = optimal |

### Savings math

| Test | What it covers |
|---|---|
| Annual savings = 12 × monthly savings | Math correctness — no rounding errors in annualization |
| Savings are never negative | Floor at zero — no negative savings edge case |

### Credex CTA threshold

| Test | What it covers |
|---|---|
| Shows Credex when savings exceed $500/mo | `showCredex` flag triggers correctly above threshold |
| Does not show Credex for optimal stack | No false positive on Credex CTA |

### Edge cases

| Test | What it covers |
|---|---|
| Handles empty tools array | No crash on zero-tool input |
| Skips unknown tool IDs gracefully | No crash on bad toolId — tool silently skipped |

### Use-case mismatch

| Test | What it covers |
|---|---|
| Recommends switching coding tool for writing team | `fitsUseCase()` — coding category fails for writing use case |
| Does not flag coding tools for mixed teams | `fitsUseCase()` — mixed use case accepts all tool categories |

**Total: 13 tests. All cover the audit engine specifically.**
