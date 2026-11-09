export const TARGET = 7;
export type Card = {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  balance: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  lastBalanceAction: string;
};
export type PublicCard = { firstName: string; balance: number; target: number };
export type Activity = {
  id: string;
  action: string;
  actor: string;
  at: string;
  before: number;
  after: number;
};
export type Command = {
  action: "create" | "stamp" | "redeem" | "undo" | "update" | "replace";
  operationId: string;
  id?: string;
  revision?: number;
  name?: string;
  phone?: string;
  active?: boolean;
  token?: string;
};
export class LoyaltyError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const normalizeName = (s: string) =>
  s
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export const normalizePhone = (s: string) => s.replace(/\D/g, "");
export function safeReturnPath(value: unknown) {
  if (typeof value !== "string") return "/admin";
  return /^\/admin\/loyalty(?:\?(?:token=[A-Za-z0-9_-]{43}|card=[a-f0-9-]{36}))?$/.test(
    value,
  )
    ? value
    : "/admin";
}
export function scanToken(value: string, origin: string): string | null {
  try {
    const url = new URL(value);
    const match = /^\/vip\/([A-Za-z0-9_-]{43})$/.exec(url.pathname);
    return url.origin === origin &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
      ? (match?.[1] ?? null)
      : null;
  } catch {
    return null;
  }
}
