"use client";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import StampGrid from "../../../../components/loyalty/stamp-grid";
import RewardIcon from "../../../../components/loyalty/reward-icon";
import Qr from "../../../../components/loyalty/qr";
import {
  TARGET,
  DRINK_TARGET,
  type PublicCard,
} from "../../../../lib/loyalty/types";
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
            <StampGrid balance={card.balance} />
            <p className="loyalty-balance">
              {card.balance} / {TARGET} sellos
            </p>
            <div className="loyalty-rewards">
              <div
                className={
                  card.balance >= DRINK_TARGET && !card.drinkRedeemed
                    ? "reward-ready"
                    : ""
                }
              >
                <RewardIcon reward="drink" />
                <div>
                  <strong>{DRINK_TARGET} sellos · Bebida gratis</strong>
                  <small>
                    {card.drinkRedeemed
                      ? "Ya canjeada en esta tarjeta"
                      : card.balance >= DRINK_TARGET
                        ? "Disponible · Pídela al personal"
                        : DRINK_TARGET - card.balance === 1
                          ? "Falta 1 sello"
                          : `Faltan ${DRINK_TARGET - card.balance} sellos`}
                  </small>
                </div>
              </div>
              <div className={card.balance === TARGET ? "reward-ready" : ""}>
                <RewardIcon reward="shisha" />
                <div>
                  <strong>{TARGET} sellos · Shisha gratis</strong>
                  <small>
                    {card.balance === TARGET
                      ? "Disponible · Pídela al personal"
                      : TARGET - card.balance === 1
                        ? "Falta 1 sello"
                        : `Faltan ${TARGET - card.balance} sellos`}
                  </small>
                </div>
              </div>
            </div>
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
          Un sello por pedido pagado, confirmado por el personal. A los{" "}
          {DRINK_TARGET} sellos, una bebida gratis y sigues sumando. A los{" "}
          {TARGET} sellos, una shisha gratis. Canjea ambos premios para empezar
          de nuevo. Una bebida y una shisha por tarjeta completa, de la
          selección indicada por el personal. Sin caducidad.
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
