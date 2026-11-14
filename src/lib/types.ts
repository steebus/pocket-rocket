export type MascotId = "blob" | "bean" | "cat" | "bunny" | "robot" | "dino";
export type KidColorId = "pink" | "sky" | "lime" | "orange" | "violet" | "yellow";
export type JobIconId = "bed" | "bowl" | "brush" | "toys" | "dishes" | "plant" | "rubbish" | "laundry" | "table" | "shoes" | "book" | "bag" | "bath" | "sweep" | "car" | "pet";
export type GoalIconId = "scooter" | "kite" | "bike" | "ball" | "teddy" | "blocks" | "game" | "book";
export type Repeat = "daily" | "weekly" | "once";
export interface Goal { name: string; icon: GoalIconId; priceCents: number }
export type InterestPer = "week" | "month" | "year";
/** Optional interest. Missing means off. `paidThrough` is the start of the local day interest has been paid up to; `carry` is the unpaid fraction of a cent (0 to <1). */
export interface Interest { enabled: boolean; ratePercent: number; per: InterestPer; paidThrough: number; carry: number }
export interface Kid { id: string; name: string; mascot: MascotId; color: KidColorId; goal?: Goal; interest?: Interest }
export interface Job { id: string; name: string; icon: JobIconId; valueCents: number; kidIds: string[]; repeat: Repeat; archived?: boolean }
export interface Claim { id: string; jobId: string; kidId: string; claimedAt: number; status: "waiting" | "approved" | "declined"; resolvedAt?: number }
export interface Txn { id: string; kidId: string; type: "job" | "gift" | "spend" | "interest"; amountCents: number /* signed */; note?: string; jobId?: string; at: number }
export interface Settings { pin: string; muted: boolean }
export interface PocketState { kids: Kid[]; jobs: Job[]; claims: Claim[]; txns: Txn[]; settings: Settings }
export type JobStatus = "todo" | "waiting" | "done";
export interface Badge { id: string; name: string; description: string; earned: boolean }
