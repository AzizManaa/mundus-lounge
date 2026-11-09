"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import "./admin.css";
import { safeReturnPath } from "../../../lib/loyalty/types";

export default function AdminLogin({
  configured,
  error,
  returnTo,
}: {
  configured: boolean;
  error?: string;
  returnTo?: string;
}) {
  const loyalty = safeReturnPath(returnTo).startsWith("/admin/loyalty");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  async function login() {
    setBusy(true);
    setFailed(false);
    try {
      await signIn("google", { callbackUrl: safeReturnPath(returnTo) });
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }
  return (
    <div className="menu-admin">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <Image
              src="/brand/mundus-mark.svg"
              width={36}
              height={36}
              alt=""
              unoptimized
            />
            <div>
              <strong>Mundus Lounge</strong>
              <span>{loyalty ? "Tarjetas VIP" : "Gestión de carta"}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="admin-main admin-main-login">
        <section className="admin-login">
          <div className="admin-eyebrow">
            {loyalty ? "TUS CLIENTES, MÁS CERCA" : "TU CARTA, AL DÍA"}
          </div>
          <h1>
            Un cambio pequeño.
            <br />
            Todo listo para esta noche.
          </h1>
          <p>
            {loyalty
              ? "Gestiona tarjetas VIP, añade sellos y canjea bebidas desde tu móvil."
              : "Actualiza productos, precios y disponibilidad desde tu móvil."}
          </p>
          {(error || failed) && (
            <div className="admin-feedback is-error" role="alert">
              <strong>No se pudo iniciar sesión</strong>
              <p>
                {error === "AccessDenied"
                  ? "Esta cuenta no tiene acceso a la carta. Elige una cuenta autorizada."
                  : "Vuelve a intentarlo con tu cuenta de Google autorizada."}
              </p>
            </div>
          )}
          <div className="admin-login-card">
            <button
              type="button"
              className="admin-button admin-button-primary"
              disabled={!configured || busy}
              onClick={() => void login()}
            >
              {busy ? "Conectando…" : "Continuar con Google"}
            </button>
            <p className="admin-footnote">
              {configured
                ? "Solo las cuentas autorizadas pueden entrar."
                : "El acceso con Google aún no está configurado."}
            </p>
          </div>
          <p className="admin-footnote">
            {loyalty
              ? "Acceso privado · Solo el personal autorizado puede añadir sellos."
              : "Acceso privado · Los cambios se guardan en la carta real."}
          </p>
        </section>
      </main>
    </div>
  );
}
