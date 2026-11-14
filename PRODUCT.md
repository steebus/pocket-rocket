# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) deployed on Vercel, Convex backend. The first build runs on local fixtures behind a data layer shaped so Convex can replace it later. Framework choice within "Vercel frontend" was delegated: Next.js + TypeScript, CSS with design tokens, Motion for animation.

## Users

- **Parents** in one household. They open the app to see each child's balance, approve jobs the kids have claimed, add gifts, and deduct money when they help a child spend it. Usually on a phone, in short bursts.
- **Children aged 3 to 10.** They open the app on their own phone or tablet, tap their own face, see how much they have, see their jobs, and tap "I did it". The youngest cannot read.

## Product Purpose

Pocket Rocket is a chore and pocket money tracker for a family. It tracks a pretend account per child. No real money moves; the parent is the bank and handles actual cash themselves. Success is kids wanting to check their jobs and balance, and parents spending seconds, not minutes, keeping it up to date.

## Positioning

A pocket money ledger a three-year-old can use on their own: pictures first, spoken job names, and a kid-claims / parent-approves loop.

## Operating Context

- Kids' devices stay signed in to the family. The app opens on a "Who's playing?" picker of child avatars with no lock.
- Everything a parent can do sits behind a PIN so the app can live on a child's device.
- Money is dollars and cents ($).

## Capabilities and Constraints

- **Accounts:** one balance per child. Parent can add money (gift) and deduct money (spend), each with an optional note.
- **Jobs:** each has a picture, a short name, and a dollar value. Assigned to one or more specific children. Repeat daily, weekly, or one-off; repeating jobs reset automatically.
- **Sign-off:** the child claims a job ("I did it"); it waits; the parent approves (balance goes up) or declines.
- **Kid view:** balance, available jobs, waiting jobs, savings goal, picture-based history, streaks and badges. Big picture plus a one or two word label per job, and tapping reads the name aloud (device speech synthesis).
- **Savings goals:** a child saves towards one thing with a picture and a price; progress shown as they earn.
- **Streaks and badges:** rewards for consecutive days of jobs and milestones.
- **Sounds:** coin and cheer effects, with a mute switch in the parent area.
- **Avatars:** each child picks an illustrated character and a personal colour that themes their view. No photo upload.
- **Devices:** phone and tablet both properly designed (kids mostly tablets, parents mostly phones).
- **Out of scope:** real payments, bank links, multiple households. Authentication and sync arrive with the Convex backend.
- **Undecided:** whether a device can be pinned to a single child; multi-parent accounts; PIN recovery.

## Brand Commitments

- Name: **Pocket Rocket**.
- The owner supplied a neobrutalist mobile UI reference (thick dark outlines, flat saturated colour fields, rounded cards, pill buttons, cartoon mascot characters) and asked for a kid-friendly, fun, motion-heavy UI.

## Evidence on Hand

No existing assets, logo, illustrations or content. Character and job artwork must be authored. Fixture families and jobs are synthetic.

## Product Principles

1. A non-reader can do everything a child needs to do.
2. The parent's routine actions (approve, gift, spend) take one or two taps.
3. Earning is the celebrated moment; spending and declining are calm and never shaming.
4. The kid view cannot reach parent controls without the PIN.
5. Pretend money behaves like real money: every change is recorded and visible.

## Accessibility & Inclusion

Very large touch targets for small hands, no reading required in the kid view, sound never required, and a reduced-motion path for every animation.
