"use client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Qr from "../../../../components/loyalty/qr";
import { TARGET, type PublicCard } from "../../../../lib/loyalty/types";
export default function VipCard({
  token,
  initialCard,
  initialError,
}: {
  token: string;
  initialCard: PublicCard | null;
  initialError: string;
}) {
  const [card, setCard] = useState<PublicCard | null>(initialCard);
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const url = origin ? origin + "/vip/" + token : "";
  const running = useRef(false);
  const refresh = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/loyalty/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCard(data);
    } catch (error) {
      setCard(null);
      setError(
        error instanceof Error
          ? error.message
          : "Saldo no disponible. Vuelve a intentarlo.",
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }, [token]);
  useEffect(() => {
    const visible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const restored = (event: PageTransitionEvent) => {
      if (event.persisted) void refresh();
    };
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("pageshow", restored);
    return () => {
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("pageshow", restored);
    };
  }, [refresh, token]);
  return (
    <main className="loyalty customer-card">
      <header className="loyalty-brand">
        <Image
          src="/brand/mundus-mark.svg"
          width={48}
          height={48}
          alt=""
          unoptimized
        />
        <span>
          MUNDUS LOUNGE<small>UN LUGAR AL QUE VOLVER</small>
        </span>
      </header>
      <section className="loyalty-pass">
        <p className="loyalty-eyebrow">TU TARJETA VIP</p>
        <h1>
          {card ? `Hola, ${card.firstName}.` : "Tus buenos momentos suman."}
        </h1>
        <p>Cada pedido suma. Cada sello te acerca a tu próxima invitación.</p>
        {error && (
          <p className="loyalty-error" role="alert">
            {error}
          </p>
        )}
        {card && (
          <>
            <div
              className="loyalty-stamps"
              aria-label={`${card.balance} de ${TARGET} sellos`}
            >
              {Array.from({ length: TARGET }, (_, i) => (
                <span
                  key={i}
                  className={i < card.balance ? "filled" : ""}
                  aria-hidden="true"
                >
                  {i === TARGET - 1 ? "✦" : i < card.balance ? "✧" : i + 1}
                </span>
              ))}
            </div>
            <p className="loyalty-balance">
              {card.balance} / {TARGET} sellos
            </p>
            <h2>
              {card.balance === TARGET
                ? "Tu bebida gratis está lista"
                : `A ${TARGET - card.balance} ${TARGET - card.balance === 1 ? "sello" : "sellos"} de tu bebida gratis`}
            </h2>
            <p>Muestra tu tarjeta al personal.</p>
            {url && <Qr value={url} />}
          </>
        )}
        <button disabled={busy} onClick={() => void refresh()}>
          {busy ? "Consultando saldo…" : "Actualizar saldo"}
        </button>
      </section>
      <section className="loyalty-terms">
        <p>
          Un sello por pedido pagado, confirmado por el personal. Con siete
          sellos, una bebida gratis de la selección indicada por el personal.
          Canjea tu bebida para empezar de nuevo. Sin caducidad.
        </p>
        <details>
          <summary>Guarda tu tarjeta en el móvil</summary>
          <p>
            iPhone: abre en Safari → Compartir → Añadir a pantalla de inicio.
          </p>
          <p>Android: abre el menú de Chrome → Añadir a pantalla de inicio.</p>
          <p>Necesitas conexión para consultar tu saldo.</p>
        </details>
        <p>
          Tu enlace es personal. Si lo pierdes o lo compartes por error, pide
          uno nuevo al personal.
        </p>
      </section>

    </main>
  );
}
