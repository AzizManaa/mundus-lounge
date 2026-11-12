"use client";
import { useEffect, useRef, useState } from "react";
import Qr from "./qr";

export default function ShareDialog({ url, onClose }: { url: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => { dialog.close(); };
  }, []);

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: "Tu tarjeta VIP Mundus", url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage("Enlace copiado");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMessage("No se pudo compartir. Copia el enlace del campo.");
    }
  }

  return (
    <dialog ref={ref} className="loyalty-share-dialog loyalty-share" aria-labelledby="share-card-title" onCancel={onClose}>
      <div className="loyalty-dialog-header">
        <h2 id="share-card-title">Comparte la tarjeta</h2>
        <button type="button" onClick={onClose} autoFocus>Cerrar</button>
      </div>
      <p>El cliente puede escanear este QR con la cámara de su móvil para abrir su tarjeta.</p>
      <Qr key={url} value={url} />
      <label>
        Enlace de la tarjeta
        <input readOnly value={url} onFocus={(e) => e.target.select()} />
      </label>
      <button type="button" onClick={() => void share()}>Compartir / copiar enlace</button>
      {message && <p role="status">{message}</p>}
    </dialog>
  );
}
