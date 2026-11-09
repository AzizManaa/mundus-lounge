import { writeFile, readFile } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { loyaltyDb } from "../src/lib/loyalty/db";
const roots = ["loyaltyCards", "loyaltyTokens", "loyaltyOperations"];
const [mode, file, confirmedProject] = process.argv.slice(2);
async function main() {
  if (
    !["export", "restore"].includes(mode) ||
    !file ||
    confirmedProject !== process.env.LOYALTY_FIREBASE_PROJECT_ID
  )
    throw new Error(
      "Usage: tsx scripts/loyalty-backup.ts export|restore /absolute/private/backup.json PROJECT_ID",
    );
  if (
    !resolve(file).startsWith("/") ||
    !relative(process.cwd(), resolve(file)).startsWith("..")
  )
    throw new Error("Choose a backup path outside the repository.");
  const db = loyaltyDb();
  if (mode === "export") {
    const docs: { path: string; data: FirebaseFirestore.DocumentData }[] = [];
    for (const root of roots) {
      for (const snap of (await db.collection(root).get()).docs) {
        docs.push({ path: snap.ref.path, data: snap.data() });
        if (root === "loyaltyCards")
          for (const activity of (await snap.ref.collection("activity").get())
            .docs)
            docs.push({ path: activity.ref.path, data: activity.data() });
      }
    }
    await writeFile(
      file,
      JSON.stringify(
        {
          format: 1,
          project: confirmedProject,
          at: new Date().toISOString(),
          docs,
        },
        null,
        2,
      ),
      { mode: 0o600, flag: "wx" },
    );
    console.log(
      `Exported ${docs.length} documents. Store this private backup securely.`,
    );
  } else {
    const backup = JSON.parse(await readFile(file, "utf8"));
    if (
      backup.format !== 1 ||
      !Array.isArray(backup.docs) ||
      !backup.docs.every(
        (d: { path: string; data: unknown }) =>
          typeof d.path === "string" &&
          /^(loyaltyCards\/[a-f0-9-]{36}(\/activity\/[a-f0-9-]{36})?|loyaltyTokens\/[a-f0-9]{64}|loyaltyOperations\/[a-f0-9-]{36})$/.test(
            d.path,
          ) &&
          d.data &&
          typeof d.data === "object",
      )
    )
      throw new Error("Invalid backup.");
    for (const root of roots)
      if (!(await db.collection(root).limit(1).get()).empty)
        throw new Error(
          "Restore requires empty loyalty collections. Never overwrite a live database.",
        );
    // Run with the website offline. Create-only writes also prevent accidental overwrites.
    for (let i = 0; i < backup.docs.length; i += 400) {
      const batch = db.batch();
      for (const d of backup.docs.slice(i, i + 400))
        batch.create(db.doc(d.path), d.data);
      await batch.commit();
    }
    console.log(
      `Restored ${backup.docs.length} documents. Verify before enabling the website.`,
    );
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Backup failed.");
  process.exitCode = 1;
});
