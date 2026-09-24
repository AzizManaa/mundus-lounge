"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../i18n";

type Hours = { day: string; display: string; opens?: string; closes?: string };

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function getTonightStatus(now: Date, hours: readonly Hours[], locale: Locale) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone: "Europe/Madrid",
    weekday: "long",
  }).formatToParts(now);
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? "";
  const day = part("weekday");
  const currentMinutes = Number(part("hour")) * 60 + Number(part("minute"));
  const todayIndex = hours.findIndex((entry) => entry.day === day);
  const today = hours[todayIndex];
  const previous = hours[(todayIndex + hours.length - 1) % hours.length];

  if (previous?.opens && previous.closes) {
    const closing = minutes(previous.closes);
    if (closing <= minutes(previous.opens) && currentMinutes < closing) {
      return locale === "es" ? `Abierto ahora · hasta las ${previous.closes}` : `Open now · until ${previous.closes}`;
    }
  }

  if (today?.opens && today.closes) {
    const opening = minutes(today.opens);
    const closing = minutes(today.closes);
    if (currentMinutes >= opening && (closing <= opening || currentMinutes < closing)) {
      return locale === "es" ? `Abierto ahora · hasta las ${today.closes}` : `Open now · until ${today.closes}`;
    }
    if (currentMinutes < opening) {
      return locale === "es" ? `Abre hoy a las ${today.opens}` : `Opens today at ${today.opens}`;
    }
  }

  return locale === "es" ? "Cerrado ahora · consulta el horario" : "Closed now · see opening hours";
}

export function TonightHours({ hours, locale }: { hours: readonly Hours[]; locale: Locale }) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setStatus(getTonightStatus(new Date(), hours, locale));
    update();
    const interval = window.setInterval(update, 60_000);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, [hours, locale]);

  return <span aria-live="polite">{status ?? (locale === "es" ? "Consulta el horario" : "See opening hours")}</span>;
}
