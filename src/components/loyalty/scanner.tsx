"use client";
import { useEffect, useRef, useState } from "react";
import { scanToken } from "../../lib/loyalty/types";

const cameraPreference = "mundus-loyalty-camera";
function savedCamera() {
  try {
    return localStorage.getItem(cameraPreference) || undefined;
  } catch {
    return undefined;
  }
}
function rememberCamera(id?: string) {
  try {
    if (id) localStorage.setItem(cameraPreference, id);
    else localStorage.removeItem(cameraPreference);
  } catch {
    /* Camera scanning also works when browser storage is unavailable. */
  }
}

export default function Scanner({
  onScan,
  onClose,
}: {
  onScan: (token: string) => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [requestedCamera, setRequestedCamera] = useState<string>();
  const [activeCamera, setActiveCamera] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;
    let found = false;
    import("@zxing/browser")
      .then(async ({ BrowserQRCodeReader }) => {
        if (cancelled || !video.current) return;
        const preview = video.current;
        const reader = new BrowserQRCodeReader();
        const open = (id?: string) =>
          reader.decodeFromVideoDevice(id, preview, (result, _, controls) => {
            if (!result || cancelled || found) return;
            const token = scanToken(result.getText(), window.location.origin);
            if (!token) {
              setError("Este QR no es una tarjeta de Mundus.");
              return;
            }
            found = true;
            controls.stop();
            onScan(token);
          });
        let preferred = requestedCamera || savedCamera();
        let controls;
        try {
          controls = await open(preferred);
        } catch (e) {
          // Device IDs may change after clearing permissions or removing a camera.
          if (
            !preferred ||
            !(e instanceof Error || e instanceof DOMException) ||
            !["NotFoundError", "OverconstrainedError"].includes(e.name) ||
            cancelled
          )
            throw e;
          rememberCamera();
          preferred = undefined;
          controls = await open();
        }
        stop = () => controls.stop();
        if (cancelled || found) {
          stop();
          return;
        }
        const stream = preview.srcObject as MediaStream | null;
        const id =
          stream?.getVideoTracks()[0]?.getSettings().deviceId ||
          preferred ||
          "";
        setActiveCamera(id);
        if (preferred && id) rememberCamera(id);
        // Enumerate after permission, when browsers can expose camera names.
        try {
          const devices = await BrowserQRCodeReader.listVideoInputDevices();
          if (!cancelled && !found)
            setCameras(devices.filter((device) => device.deviceId));
        } catch {
          /* Keep scanning even if this browser cannot list cameras. */
        }
        if (!cancelled && !found) setReady(true);
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
  }, [onScan, requestedCamera]);

  return (
    <section className="loyalty-panel">
      <h2>Escanear y añadir sello</h2>
      {cameras.length > 1 && (
        <label>
          Cámara
          <select
            value={activeCamera}
            disabled={!ready && !error}
            onChange={(event) => {
              setReady(false);
              setError("");
              setActiveCamera(event.target.value);
              setRequestedCamera(event.target.value);
            }}
          >
            {!cameras.some((camera) => camera.deviceId === activeCamera) && (
              <option value="">Cámara actual</option>
            )}
            {cameras.map((camera, index) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Cámara ${index + 1}`}
              </option>
            ))}
          </select>
          <small>
            Elige la cámara con la vista más natural. Recordaremos tu elección
            en este navegador.
          </small>
        </label>
      )}
      <video ref={video} autoPlay muted playsInline className="loyalty-video" />
      <p role="status">
        {error ||
          (ready
            ? "Escanea el QR después de un pedido pagado. Se añadirá un sello y se cerrará la cámara."
            : "Abriendo cámara…")}
      </p>
      <button onClick={onClose}>Cerrar cámara</button>
    </section>
  );
}
