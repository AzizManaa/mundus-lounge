// Only the loopback emulator and demo projects may be reset by tests.
export async function clearEmulator(project = "demo-mundus-loyalty") {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (
    !/^127\.0\.0\.1:\d+$/.test(host ?? "") ||
    !/^demo-[a-z0-9-]+$/.test(project)
  )
    throw new Error("Refusing to clear a non-demo database.");
  const response = await fetch(
    `http://${host}/emulator/v1/projects/${project}/databases/(default)/documents`,
    { method: "DELETE" },
  );
  if (!response.ok) throw new Error("Could not clear emulator test data.");
}
