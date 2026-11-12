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
import ShareDialog from "../../../../components/loyalty/share-dialog";
import {
  TARGET,
  type Card,
  type Activity,
  type Command,
} from "../../../../lib/loyalty/types";
import "../../../../components/loyalty/loyalty.css";
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
          setError("Tarjeta eliminada. No se pudo actualizar la lista. Pulsa Actualizar.");
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
  return (
    <main className="loyalty">
      <header className="loyalty-brand">
        <Image
          src="/brand/mundus-mark.svg"
          width={42}
          height={42}
          alt=""
          unoptimized
        />
        <span>
          MUNDUS LOUNGE<small>GESTIÓN · FIDELIZACIÓN</small>
        </span>
      </header>
      <nav className="loyalty-actions">
        <Link href="/admin" prefetch={false}>
          ← Carta
        </Link>
        <button
          disabled={locked}
          onClick={() => void signOut({ callbackUrl: "/admin" })}
        >
          Salir
        </button>
      </nav>
      <p className="loyalty-muted">Sesión: {email}</p>
      {!selected && !creating && (
        <button
          disabled={locked}
          onClick={() => void perform(() => list(search))}
        >
          Actualizar tarjetas
        </button>
      )}
      <h1>
        Buenos momentos.
        <br />
        Clientes que vuelven.
      </h1>
      <p>Un pedido, un sello. Siete sellos, una bebida de regalo.</p>
      {error && (
        <div className="loyalty-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="loyalty-notice" role="status">
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
      {!selected && !creating && (
        <>
          <div className="loyalty-actions">
            <button
              className="loyalty-primary"
              disabled={locked}
              onClick={() => {
                setScanning(false);
                setCreating(true);
                setName("");
                setPhone("");
                setIssued("");
              }}
            >
              + Nueva tarjeta VIP
            </button>
            <button disabled={locked} onClick={() => setScanning(true)}>
              Escanear y añadir sello
            </button>
          </div>
          {scanning && (
            <Scanner onScan={onScan} onClose={() => setScanning(false)} />
          )}
          <form
            className="loyalty-actions"
            onSubmit={(e) => {
              e.preventDefault();
              setScanning(false);
              void perform(() => list(search));
            }}
          >
            <input
              aria-label="Buscar por nombre o teléfono"
              maxLength={100}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre o teléfono (desde el inicio)"
            />
            <button disabled={locked}>Buscar</button>
          </form>
          <div className="loyalty-list">
            {cards.map((card) => (
              <button
                key={card.id}
                disabled={locked}
                onClick={() => {
                  setScanning(false);
                  setIssued("");
                  void perform(() => detail(card.id));
                }}
              >
                <span>
                  <strong>{card.name}</strong>
                  <small>
                    {card.phone || "Sin teléfono"} ·{" "}
                    {card.active ? "Activa" : "Desactivada"}
                  </small>
                </span>
                <span>
                  {card.balance}/{TARGET} →
                </span>
              </button>
            ))}
          </div>
          {!cards.length && (
            <p>No hay tarjetas que mostrar. Busca o crea la primera.</p>
          )}
          {truncated && (
            <p>Hay más resultados. Escribe más letras o números.</p>
          )}
          {next && (
            <button
              disabled={locked}
              onClick={() => void perform(() => list(appliedSearch, next))}
            >
              Ver más tarjetas
            </button>
          )}
        </>
      )}
      {(creating || selected) && (
        <>
          <button
            disabled={locked}
            onClick={() => {
              setSelected(null);
              setCreating(false);
              setIssued("");
              window.history.replaceState(null, "", "/admin/loyalty");
              setScanning(false);
              void perform(() => list(search));
            }}
          >
            ← Volver a tarjetas
          </button>
          {selected && (
            <section className="loyalty-panel">
              <p className="loyalty-eyebrow">
                {selected.active ? "TARJETA ACTIVA" : "TARJETA DESACTIVADA"}
              </p>
              <h2>{selected.name}</h2>
              <p className="loyalty-balance">
                {selected.balance} / {TARGET} sellos
              </p>
              <p>
                {selected.balance === TARGET
                  ? "Bebida gratis disponible. Confirma la entrega para canjear."
                  : "Confirma la identidad y el pedido antes de añadir un sello."}
              </p>
              <div className="loyalty-actions">
                <button
                  className="loyalty-primary"
                  disabled={
                    locked || !selected.active || selected.balance >= TARGET
                  }
                  onClick={() => mutate("stamp")}
                >
                  + Añadir sello
                </button>
                <button
                  className="loyalty-primary"
                  disabled={
                    locked || !selected.active || selected.balance !== TARGET
                  }
                  onClick={() => mutate("redeem")}
                >
                  Canjear bebida
                </button>
                <button
                  disabled={
                    locked ||
                    !selected.active ||
                    selected.lastBalanceAction !== "stamp"
                  }
                  onClick={() => mutate("undo")}
                >
                  Deshacer último sello
                </button>
                <button disabled={locked} onClick={showShare}>
                  Mostrar QR y enlace
                </button>
                <button
                  disabled={locked}
                  onClick={() => void perform(() => detail(selected.id))}
                >
                  Actualizar
                </button>
              </div>
            </section>
          )}
          <form
            className="loyalty-panel"
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
            <h2>{creating ? "Nueva tarjeta VIP" : "Datos del cliente"}</h2>
            <fieldset disabled={locked}>
              <label>
                Nombre del cliente
                <input
                  required
                  maxLength={100}
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Teléfono <small>Opcional · sin mensajes ni verificación</small>
                <input
                  type="tel"
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              {selected && (
                <label className="loyalty-checkbox">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />{" "}
                  Tarjeta activa
                </label>
              )}
              <button className="loyalty-primary" type="submit">
                {creating ? "Crear y compartir tarjeta" : "Guardar datos"}
              </button>
            </fieldset>
          </form>
          {selected && (
            <>
              <section className="loyalty-panel">
                <h2>¿Ha perdido su enlace?</h2>
                <p>
                  El nuevo enlace conserva los sellos e invalida el anterior.
                </p>
                <button disabled={locked} onClick={() => mutate("replace")}>
                  Reemplazar enlace
                </button>
              </section>
              <section className="loyalty-panel">
                <h2>Actividad reciente</h2>
                {activity.map((item) => (
                  <div className="loyalty-activity" key={item.id}>
                    <strong>
                      {labels[item.action] || item.action} · {item.before} →{" "}
                      {item.after}
                    </strong>
                    <small>
                      {new Date(item.at).toLocaleString("es-ES", {
                        timeZone: "Europe/Madrid",
                      })}{" "}
                      · {item.actor}
                    </small>
                  </div>
                ))}
              </section>
              <section className="loyalty-panel">
                <h2>Eliminar tarjeta</h2>
                <p>
                  Borra los datos, los sellos y el historial de este cliente.
                  Para una pausa temporal, desactiva la tarjeta en sus datos.
                </p>
                <button
                  className="loyalty-danger"
                  disabled={locked}
                  onClick={() => mutate("delete")}
                >
                  Eliminar tarjeta permanentemente
                </button>
              </section>
            </>
          )}
        </>
      )}
      <footer className="loyalty-terms">
        Un sello por pedido pagado · Siete sellos = una bebida · Sin caducidad ·
        Selección de bebidas a criterio del personal.
      </footer>
    </main>
  );
}
