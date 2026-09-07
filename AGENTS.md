# Project: E-Sign Analytics Dashboard

## Stack
Next.js (App Router) + TypeScript strict + Tailwind + Recharts + TanStack Query.
Package manager: pnpm. Never npm or yarn.

## Environment
WSL2 Ubuntu on Windows 11. Bash. All paths are Linux paths under
/home/<user>/dev/esign-analytics. Never reference C:\ or /mnt/c.
Node is managed by nvm — do not suggest apt-installing node.
Limit noisy command output (e.g. `git log -n 5`) to protect context.

## Architecture rules
- Contracts in src/lib/analytics/types.ts are DOMAIN-FREE. No e-sign nouns
  (document, signer, approval) may appear in types.ts or in any component.
- Domain meaning lives only in src/lib/analytics/packs/*.ts as plain config.
- Components render from pack config; they never import a source directly.
  Only from lib/analytics/registry and lib/analytics/types.
- Every feature must work against BOTH mock-esign and mock-ecommerce.
  If it only works for one, the abstraction is wrong.
- All external API responses parsed through zod before use.
- Mobile-first: design at 375px. Every chart readable on phone.
- No `any`. No non-null assertions without a comment.

## Do not
- Do not add a component library (no MUI, no Chakra). Tailwind + custom only.
- Do not commit .env.local.