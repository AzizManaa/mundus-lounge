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

export const validToken = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
export const validId = (value: unknown): value is string =>
  typeof value === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value);

// Build a stable, validated command; extra client fields never reach the database.
export function parseCommand(value: unknown): Command {
  const invalid = (): never => {
    throw new LoyaltyError(400, "Operación no válida. Revisa los datos.");
  };
  if (!value || typeof value !== "object" || Array.isArray(value))
    return invalid();
  const body = value as Record<string, unknown>;
  const { action, operationId } = body;
  if (
    typeof action !== "string" ||
    !["create", "stamp", "redeem", "undo", "update", "replace"].includes(
      action,
    ) ||
    !validId(operationId)
  )
    return invalid();
  const command: Command = { action: action as Command["action"], operationId };
  if (action !== "create") {
    if (
      !validId(body.id) ||
      !Number.isSafeInteger(body.revision) ||
      (body.revision as number) < 0
    )
      return invalid();
    command.id = body.id;
    command.revision = body.revision as number;
  }
  if (action === "create" || action === "replace") {
    if (!validToken(body.token)) return invalid();
    command.token = body.token;
  }
  if (action === "create" || action === "update") {
    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.length > 100 ||
      typeof body.phone !== "string" ||
      body.phone.length > 30
    )
      return invalid();
    const phone = body.phone.trim();
    if (
      phone &&
      (!/^\+?[\d\s().-]{3,30}$/.test(phone) || normalizePhone(phone).length < 3)
    )
      return invalid();
    command.name = body.name.trim();
    command.phone = phone;
    if (action === "update") {
      if (typeof body.active !== "boolean") return invalid();
      command.active = body.active;
    }
  }
  return command;
}
