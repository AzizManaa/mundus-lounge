"use client";
import { useEffect, useRef, useState } from "react";
export default function Qr({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import("@zxing/browser")
      .then(({ BrowserQRCodeSvgWriter }) => {
        if (!cancelled && ref.current)
          ref.current.replaceChildren(
            new BrowserQRCodeSvgWriter().write(value, 280, 280),
          );
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);
  return (
    <div className="loyalty-qr" role="img" aria-label="Código QR de tu tarjeta">
      <div ref={ref} />
      {error && <p>No se pudo cargar el QR. Actualiza la página.</p>}
    </div>
  );
}
