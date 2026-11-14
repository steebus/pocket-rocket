# Pocket Rocket

A chore and pocket money tracker for one family. Pretend money only: the parent is the bank.

Each child has a balance. Jobs have a picture, a short name and a value, are assigned to specific kids, and repeat daily, weekly or once. A child taps "I did it", a parent (behind a PIN) approves or declines, and approved jobs pay into the balance. Parents can also add gifts and deduct spends, and can switch on optional daily-compounding interest for a child (older kids), which is paid the next time they open their jar. Built for ages 3 to 10, so everything a child does works with pictures alone.

Next.js 15 (App Router, TypeScript), React 19, CSS Modules with design tokens in `src/app/globals.css`, Motion for animation, vitest for the pure logic. Money is always integer cents.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests for money, selectors and state transitions
npm run typecheck
npm run build
```

Demo family: Mia, Leo and Zadie, seeded from `src/lib/fixtures.ts`. The parent PIN is **1234**. Data is saved in the browser (`localStorage` key `pocket-rocket:v1`); the parent area will offer "Reset demo".

## Layout

- `src/lib/types.ts` data shapes
- `src/lib/interest.ts` pure interest rules (`interestDue`, rate validation); `payInterest` is a store action
- `src/lib/selectors.ts` pure reads (balance, jobs for a kid, streaks, badges)
- `src/lib/store.tsx` provider, `reduce` (pure state transitions), `usePocket`, `useParentLock`
- `src/components/art` mascots, job pictures, goal pictures, UI glyphs (authored SVG)
- `src/components/ui` Button, Coin, BalanceNumber, Sheet

## Moving to Convex

The store is shaped for it. Every read is a pure function of `PocketState` in `selectors.ts` (each becomes a Convex query, or stays client-side over a subscribed query result). Every write is one named action in `Actions` and one case in `reduce` (each becomes a Convex mutation with the same name and arguments). To switch, replace the body of `PocketProvider` so state comes from `useQuery` and actions call `useMutation`; screens only use `usePocket()` and selectors, so they do not change. PIN checking and per-family auth should move server side at that point.
