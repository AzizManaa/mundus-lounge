"use client";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { signIn, signOut } from "next-auth/react";
import {
  subscribePending,
  pendingSnapshot,
  readPending,
  setPending,
} from "../../../../lib/loyalty/pending-operation";
import Scanner from "../../../../components/loyalty/scanner";
import StaffIcon from "../../../../components/loyalty/staff-icon";
import ShareDialog from "../../../../components/loyalty/share-dialog";
import {
  TARGET,
  type Card,
  type Activity,
  type Command,
} from "../../../../lib/loyalty/types";
import "../../../../components/loyalty/loyalty.css";
import "../../../../components/loyalty/staff.css";
const labels: Record<string, string> = {
  create: "Tarjeta creada",
  stamp: "Sello añadido",
  redeem: "Bebida canjeada",
  undo: "Último sello deshecho",
  update: "Datos actualizados",
  replace: "Enlace reemplazado",
  delete: "Tarjeta eliminada permanentemente",
};
function newToken() {
  return btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function call(body: object) {
  const response = await fetch("/api/admin/loyalty", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data.error);
  return data;
}
type Initial = {
  cards?: Card[];
  next?: string | null;
  card?: Card;
  activity?: Activity[];
  error?: string;
};
export default function LoyaltyEditor({
  email,
  initial,
}: {
  email: string;
  initial: Initial;
}) {
  const [cards, setCards] = useState<Card[]>(initial.cards ?? []);
  const [selected, setSelected] = useState<Card | null>(initial.card ?? null);
  const [activity, setActivity] = useState<Activity[]>(initial.activity ?? []);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [next, setNext] = useState<string | null>(initial.next ?? null);
  const [truncated, setTruncated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initial.error ?? "");
  const [notice, setNotice] = useState("");
  const [expired, setExpired] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState(initial.card?.name ?? "");
  const [phone, setPhone] = useState(initial.card?.phone ?? "");
  const [active, setActive] = useState(initial.card?.active ?? true);
  const [scanning, setScanning] = useState(false);
  const [issued, setIssued] = useState("");
  const pendingJson = useSyncExternalStore(
    subscribePending,
    pendingSnapshot,
    () => null,
  );
  const pending = readPending(pendingJson);
  const inFlight = useRef(false);
  const report = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 401) setExpired(true);
    setError(
      e instanceof Error
        ? e.message
        : "No se pudo confirmar la operación. Reintenta la misma operación.",
    );
  }, []);
  const detail = useCallback(async (id?: string, token?: string) => {
    const data = await call({ action: "detail", id, token });
    setSelected(data.card);
    setActivity(data.activity);
    setName(data.card.name);
    setPhone(data.card.phone);
    setActive(data.card.active);
    setCreating(false);
    window.history.replaceState(
      null,
      "",
      `/admin/loyalty?card=${data.card.id}`,
    );
    return data.card as Card;
  }, []);
  const list = useCallback(async (query = "", cursor = "") => {
    const data = await call({ action: "list", search: query, cursor });
    setCards((current) => (cursor ? [...current, ...data.cards] : data.cards));
    setAppliedSearch(query);
    setNext(data.next);
    setTruncated(data.truncated);
  }, []);
  const perform = useCallback(
    async (fn: () => Promise<unknown>) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setBusy(true);
      setError("");
      setNotice("");
      try {
        await fn();
      } catch (e) {
        report(e);
      } finally {
        inFlight.current = false;
        setBusy(false);
      }
    },
    [report],
  );
  const send = useCallback(
    async (command: Command) => {
      setPending(command);
      let result;
      try {
        result = await call(command);
      } catch (e) {
        if (e instanceof ApiError && e.status < 500 && e.status !== 401) {
          setPending(null);
          if (command.id) {
            try {
              await detail(command.id);
            } catch {
              /* Keep original action error. */
            }
          }
        }
        throw e;
      }
      setPending(null);
      setCreating(false);
      setIssued(
        command.token ? window.location.origin + "/vip/" + command.token : "",
      );
      setNotice(labels[command.action]);
      if (command.action === "delete") {
        setSelected(null);
        setActivity([]);
        setName("");
        setPhone("");
        setCards((current) => current.filter((card) => card.id !== command.id));
        window.history.replaceState(null, "", "/admin/loyalty");
        try {
          await list(appliedSearch);
        } catch {
          setError(
            "Tarjeta eliminada. No se pudo actualizar la lista. Pulsa Actualizar.",
          );
        }
        return;
      }
      try {
        await detail(result.id);
      } catch {
        setError(
          "Operación confirmada. No se pudo cargar el saldo actualizado. Pulsa Actualizar.",
        );
      }
    },
    [detail, list, appliedSearch],
  );
  function mutate(action: Command["action"]) {
    if (!selected || pending || busy) return;
    const messages: Partial<Record<Command["action"], string>> = {
      stamp: `¿Añadir un sello a ${selected.name}? Confirma que corresponde a un pedido pagado.`,
      redeem: `¿Has entregado la bebida gratis a ${selected.name}? El saldo volverá a cero.`,
      undo: "¿Deshacer el último sello?",
      delete: `¿Eliminar permanentemente la tarjeta de ${selected.name}? Se perderán sus ${selected.balance} sellos, sus datos y todo el historial. El enlace dejará de funcionar. Esta acción no se puede deshacer.`,
      replace: "El enlace anterior dejará de funcionar. ¿Crear uno nuevo?",
    };
    if (
      !window.confirm(
        messages[action] ?? "¿Guardar los cambios de esta tarjeta?",
      )
    )
      return;
    const command: Command = {
      action,
      operationId: crypto.randomUUID(),
      id: selected.id,
      revision: selected.revision,
    };
    if (action === "update") Object.assign(command, { name, phone, active });
    if (action === "replace") command.token = newToken();
    void perform(() => send(command));
  }
  const onScan = useCallback(
    (token: string) => {
      setScanning(false);
      if (busy || pending) {
        setError(
          "Termina la operación pendiente antes de escanear otra tarjeta.",
        );
        return;
      }
      setIssued("");
      void perform(async () => {
        const card = await detail(undefined, token);
        await send({
          action: "stamp",
          operationId: crypto.randomUUID(),
          id: card.id,
          revision: card.revision,
        });
      });
    },
    [busy, pending, perform, detail, send],
  );
  function showShare() {
    if (!selected) return;
    void perform(async () => {
      const data = await call({ action: "share", id: selected.id });
      setIssued(window.location.origin + "/vip/" + data.token);
    });
  }
  const locked = busy || !!pending;
  function startCreate() {
    setSelected(null);
    setScanning(false);
    setCreating(true);
    setName("");
    setPhone("");
    setIssued("");
    setError("");
    setNotice("");
    window.history.replaceState(null, "", "/admin/loyalty");
    window.scrollTo({ top: 0 });
  }
  function backToCards() {
    setSelected(null);
    setCreating(false);
    setIssued("");
    setScanning(false);
    window.history.replaceState(null, "", "/admin/loyalty");
    window.scrollTo({ top: 0 });
    void perform(() => list(search));
  }
  const customerForm = (
    <form
      className="staff-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (creating) {
          if (!window.confirm("¿Crear esta tarjeta VIP?")) return;
          void perform(() =>
            send({
              action: "create",
              operationId: crypto.randomUUID(),
              token: newToken(),
              name,
              phone,
            }),
          );
        } else mutate("update");
      }}
    >
      <fieldset disabled={locked}>
        <label>
          Nombre del cliente
          <input
            required
            maxLength={100}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre y apellidos"
          />
        </label>
        <label>
          Teléfono <span className="staff-optional">Opcional</span>
          <input
            type="tel"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+34"
          />
          <small>No enviaremos mensajes.</small>
        </label>
        {selected && (
          <label className="loyalty-checkbox staff-active-control">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span>
              Tarjeta activa
              <small>Desactívala para pausar su uso sin perder sellos.</small>
            </span>
          </label>
        )}
        <button className="loyalty-primary staff-wide" type="submit">
          {busy
            ? "Guardando…"
            : creating
              ? "Crear y compartir tarjeta"
              : "Guardar cambios"}
        </button>
      </fieldset>
    </form>
  );
  return (
    <main className="loyalty loyalty-staff" aria-busy={busy}>
      <header className="staff-header">
        <div className="loyalty-brand">
          <Image
            src="/brand/mundus-mark.svg"
            width={32}
            height={32}
            alt=""
            unoptimized
          />
          <span>
            MUNDUS LOUNGE<small>TARJETAS VIP</small>
          </span>
        </div>
        <details className="staff-account">
          <summary aria-label="Cuenta y navegación">
            <StaffIcon name="more" />
          </summary>
          <div className="staff-account-menu">
            <small>Sesión iniciada</small>
            <p>{email}</p>
            <Link href="/admin" prefetch={false}>
              Gestión de carta <span aria-hidden="true">↗</span>
            </Link>
            <button
              disabled={locked}
              onClick={() => void signOut({ callbackUrl: "/admin" })}
            >
              Cerrar sesión
            </button>
          </div>
        </details>
      </header>
      {(selected || creating || scanning) && (
        <button className="staff-back" disabled={locked} onClick={backToCards}>
          <StaffIcon name="back" /> Todas las tarjetas
        </button>
      )}
      {error && (
        <div className="loyalty-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="loyalty-notice" role="status">
          <StaffIcon name="check" />
          {notice}
        </div>
      )}
      {expired && (
        <button
          onClick={() =>
            void signIn("google", {
              callbackUrl: selected
                ? `/admin/loyalty?card=${selected.id}`
                : "/admin/loyalty",
            })
          }
        >
          Volver a entrar con Google
        </button>
      )}
      {pending && !busy && (
        <section className="loyalty-panel">
          <h2>Operación sin confirmar</h2>
          <p>Reintenta la misma operación. Si ya se guardó, no se repetirá.</p>
          <button
            disabled={busy}
            onClick={() => void perform(() => send(pending))}
          >
            Reintentar operación
          </button>
        </section>
      )}
      {issued && <ShareDialog url={issued} onClose={() => setIssued("")} />}
      {scanning ? (
        <Scanner onScan={onScan} onClose={() => setScanning(false)} />
      ) : (
        <>
          {!selected && !creating && (
            <>
              <div className="staff-page-title">
                <div>
                  <h1>Tarjetas VIP</h1>
                  <p>Busca un cliente o escanea su tarjeta.</p>
                </div>
                <button
                  className="staff-icon-button"
                  aria-label="Actualizar tarjetas"
                  disabled={locked}
                  onClick={() => void perform(() => list(appliedSearch))}
                >
                  <StaffIcon name="refresh" />
                </button>
              </div>
              <form
                className="staff-search"
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  void perform(() => list(search));
                }}
              >
                <input
                  aria-label="Buscar por nombre o teléfono"
                  maxLength={100}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nombre o teléfono"
                />
                <button disabled={locked} type="submit">
                  Buscar
                </button>
              </form>
              <p className="staff-search-hint">
                Escribe el principio del nombre o teléfono.
              </p>
              <div className="staff-section-heading">
                <h2>Clientes</h2>
                <span>
                  {cards.length}
                  {next || truncated ? "+" : ""} tarjetas
                </span>
              </div>
              <div className="loyalty-list staff-customers">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    disabled={locked}
                    onClick={() => {
                      setIssued("");
                      void perform(async () => {
                        await detail(card.id);
                        window.scrollTo({ top: 0 });
                      });
                    }}
                  >
                    <span className="staff-avatar" aria-hidden="true">
                      {card.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="staff-customer-name">
                      <strong>{card.name}</strong>
                      <small>
                        {!card.active
                          ? "Desactivada"
                          : card.balance === TARGET
                            ? "Bebida disponible"
                            : card.phone || "Tarjeta VIP"}
                      </small>
                    </span>
                    <span
                      className={`staff-count${card.balance === TARGET ? " staff-count-ready" : ""}`}
                    >
                      {card.balance}
                      <small>/{TARGET}</small>
                    </span>
                    <StaffIcon name="chevron" />
                  </button>
                ))}
              </div>
              {!cards.length && (
                <div className="staff-empty">
                  <StaffIcon name="qr" />
                  <h2>
                    {appliedSearch
                      ? "Sin resultados"
                      : "Crea la primera tarjeta"}
                  </h2>
                  <p>
                    {appliedSearch
                      ? "Prueba con otro nombre o teléfono."
                      : "Crea una tarjeta y compártela con el cliente."}
                  </p>
                  {!appliedSearch && (
                    <button disabled={locked} onClick={startCreate}>
                      Crear primera tarjeta
                    </button>
                  )}
                </div>
              )}
              {truncated && (
                <p className="loyalty-muted">
                  Hay más resultados. Escribe más letras o números.
                </p>
              )}
              {next && (
                <button
                  className="staff-wide"
                  disabled={locked}
                  onClick={() => void perform(() => list(appliedSearch, next))}
                >
                  Ver más clientes
                </button>
              )}
            </>
          )}
          {creating && (
            <section className="staff-create">
              <div className="staff-page-title">
                <div>
                  <h1>Nueva tarjeta</h1>
                  <p>Solo necesitas el nombre para empezar.</p>
                </div>
              </div>
              {customerForm}
            </section>
          )}
          {selected && (
            <>
              <section className="staff-card" aria-label="Tarjeta del cliente">
                <div className="staff-card-top">
                  <span
                    className={`staff-status${selected.active ? "" : " staff-status-paused"}`}
                  >
                    <span />
                    {selected.active ? "Activa" : "Desactivada"}
                  </span>
                  <button
                    className="staff-icon-button"
                    disabled={locked}
                    aria-label="Actualizar tarjeta"
                    onClick={() => void perform(() => detail(selected.id))}
                  >
                    <StaffIcon name="refresh" />
                  </button>
                </div>
                <h1>{selected.name}</h1>
                {selected.phone && (
                  <p className="staff-customer-phone">{selected.phone}</p>
                )}
                <div className="staff-progress-heading">
                  <p>
                    <strong>{selected.balance}</strong>
                    <span> / {TARGET}</span>
                  </p>
                  <span>SELLOS</span>
                </div>
                <div
                  className="staff-stamps"
                  role="img"
                  aria-label={`${selected.balance} de ${TARGET} sellos`}
                >
                  {Array.from({ length: TARGET }, (_, i) => (
                    <span
                      key={i}
                      className={i < selected.balance ? "is-filled" : ""}
                    >
                      {i < selected.balance ? (
                        <StaffIcon name="check" />
                      ) : (
                        i + 1
                      )}
                    </span>
                  ))}
                </div>
                <p className="staff-reward-copy">
                  {!selected.active
                    ? "Reactiva la tarjeta en los datos del cliente."
                    : selected.balance === TARGET
                      ? "Una bebida de regalo lista para canjear."
                      : `${TARGET - selected.balance} ${TARGET - selected.balance === 1 ? "sello para su próxima bebida" : "sellos para su próxima bebida"}.`}
                </p>
                <button
                  className="staff-share-button"
                  disabled={locked}
                  onClick={showShare}
                >
                  <StaffIcon name="qr" /> Mostrar QR y enlace{" "}
                  <StaffIcon name="chevron" />
                </button>
              </section>
              <p className="staff-order-note">
                {selected.balance === TARGET
                  ? "Entrega la bebida antes de confirmar el canje."
                  : "Confirma el pedido pagado antes de añadir un sello."}
              </p>
              {selected.lastBalanceAction === "stamp" && selected.active && (
                <button
                  className="staff-undo"
                  disabled={locked}
                  onClick={() => mutate("undo")}
                >
                  Deshacer último sello
                </button>
              )}
              <div className="staff-disclosures">
                <details
                  className="staff-disclosure"
                  key={`${selected.id}-details`}
                >
                  <summary>
                    <span>
                      Datos del cliente<small>Nombre, teléfono y estado</small>
                    </span>
                    <StaffIcon name="chevron" />
                  </summary>
                  {customerForm}
                </details>
                <details
                  className="staff-disclosure"
                  key={`${selected.id}-activity`}
                >
                  <summary>
                    <span>
                      Actividad reciente<small>Sellos, canjes y cambios</small>
                    </span>
                    <StaffIcon name="chevron" />
                  </summary>
                  <div className="staff-history">
                    {activity.map((item) => (
                      <div className="loyalty-activity" key={item.id}>
                        <div>
                          <strong>{labels[item.action] || item.action}</strong>
                          <span>
                            {item.before} → {item.after}
                          </span>
                        </div>
                        <small>
                          {new Date(item.at).toLocaleString("es-ES", {
                            timeZone: "Europe/Madrid",
                          })}
                        </small>
                        <small>{item.actor}</small>
                      </div>
                    ))}
                    {!activity.length && (
                      <p className="loyalty-muted">Todavía no hay actividad.</p>
                    )}
                  </div>
                </details>
                <details
                  className="staff-disclosure"
                  key={`${selected.id}-manage`}
                >
                  <summary>
                    <span>
                      Gestionar tarjeta
                      <small>Reemplazar enlace o eliminar</small>
                    </span>
                    <StaffIcon name="chevron" />
                  </summary>
                  <div className="staff-management">
                    <h3>Reemplazar enlace</h3>
                    <p>
                      Solo si necesitas invalidar el anterior. Conserva todos
                      los sellos.
                    </p>
                    <button
                      className="staff-wide"
                      disabled={locked}
                      onClick={() => mutate("replace")}
                    >
                      Crear nuevo enlace
                    </button>
                    <div className="staff-danger-zone">
                      <h3>Eliminar tarjeta</h3>
                      <p>
                        Borra los datos, los sellos y el historial. No se puede
                        deshacer.
                      </p>
                      <button
                        className="loyalty-danger staff-wide"
                        disabled={locked}
                        onClick={() => mutate("delete")}
                      >
                        Eliminar permanentemente
                      </button>
                    </div>
                  </div>
                </details>
              </div>
            </>
          )}
        </>
      )}
      {!creating && !scanning && (
        <nav className="staff-dock" aria-label="Acciones rápidas">
          {selected ? (
            <>
              <button
                className="staff-scan-secondary"
                disabled={locked}
                onClick={() => {
                  setIssued("");
                  setScanning(true);
                  window.scrollTo({ top: 0 });
                }}
              >
                <StaffIcon name="scan" />
                Escanear
              </button>
              <button
                className="loyalty-primary staff-main-action"
                disabled={locked || !selected.active}
                onClick={() =>
                  mutate(selected.balance === TARGET ? "redeem" : "stamp")
                }
              >
                {busy ? (
                  "Procesando…"
                ) : selected.balance === TARGET ? (
                  "Canjear bebida"
                ) : (
                  <>
                    <StaffIcon name="plus" /> Añadir sello
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                className="staff-scan-secondary"
                disabled={locked}
                onClick={startCreate}
              >
                <StaffIcon name="plus" />
                Nueva tarjeta
              </button>
              <button
                className="loyalty-primary staff-main-action"
                disabled={locked}
                onClick={() => {
                  setScanning(true);
                  window.scrollTo({ top: 0 });
                }}
              >
                <StaffIcon name="scan" />
                Escanear QR
              </button>
            </>
          )}
        </nav>
      )}
      <footer className="staff-footer">
        7 sellos · 1 bebida · Sin caducidad
      </footer>
    </main>
  );
}
