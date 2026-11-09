"use client";
import { useEffect, useRef, useState } from "react";
import { scanToken } from "../../lib/loyalty/types";
export default function Scanner({
  onScan,
  onClose,
}: {
  onScan: (token: string) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    let found = false;
    import("@zxing/browser")
      .then(async ({ BrowserQRCodeReader }) => {
        if (cancelled || !video.current) return;
        const controls = await new BrowserQRCodeReader().decodeFromVideoDevice(
          undefined,
          video.current,
          (result, _, controls) => {
            if (!result || cancelled || found) return;
            const token = scanToken(result.getText(), window.location.origin);
            if (!token) {
              setError("Este QR no es una tarjeta de Mundus.");
              return;
            }
            found = true;
            controls.stop();
            onScan(token);
          },
        );
        stop = () => controls.stop();
        if (cancelled) stop();
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "No se pudo abrir la cámara. Permite su uso o busca al cliente por nombre o teléfono.",
          );
      });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [onScan]);
  return (
    <section className="loyalty-panel">
      <h2>Escanear tarjeta</h2>
      <video ref={video} autoPlay muted playsInline className="loyalty-video" />
      <p role="status">
        {error || "Apunta al QR del cliente. Escanear no añade sellos."}
      </p>
      <button onClick={onClose}>Cerrar cámara</button>
    </section>
  );
}
