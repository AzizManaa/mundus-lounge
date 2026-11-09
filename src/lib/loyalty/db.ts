import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { LoyaltyError } from "./types";
export function loyaltyDb() {
  if (process.env.VERCEL_ENV === "preview")
    throw new LoyaltyError(
      503,
      "Fidelización no disponible en esta vista previa.",
    );
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  const projectId = process.env.LOYALTY_FIREBASE_PROJECT_ID;
  if (
    !projectId ||
    (emulator && (process.env.VERCEL || !projectId.startsWith("demo-")))
  )
    throw new LoyaltyError(503, "Fidelización todavía no está configurada.");
  let app = getApps().find((app) => app.name === "loyalty");
  if (!app) {
    if (
      !emulator &&
      (!process.env.LOYALTY_FIREBASE_CLIENT_EMAIL ||
        !process.env.LOYALTY_FIREBASE_PRIVATE_KEY)
    )
      throw new LoyaltyError(503, "Fidelización todavía no está configurada.");
    app = initializeApp(
      {
        projectId,
        ...(emulator
          ? {}
          : {
              credential: cert({
                projectId,
                clientEmail: process.env.LOYALTY_FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.LOYALTY_FIREBASE_PRIVATE_KEY!.replace(
                  /\\n/g,
                  "\n",
                ),
              }),
            }),
      },
      "loyalty",
    );
  }
  return getFirestore(app);
}
