import { readFileSync } from "node:fs";
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, describe, it } from "vitest";

// The default bucket in Finland is never used. Nobody may read or write it, not even the board.
let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-samfalligheten",
    storage: { rules: readFileSync("storage-unused.rules", "utf8") },
  });
});

afterAll(async () => {
  await env.cleanup();
});

describe("Unused bucket is locked", () => {
  it("rejects anonymous reads", async () => {
    const storage = env.unauthenticatedContext().storage();
    await assertFails(storage.ref("documents/test.pdf").getMetadata());
  });

  it("rejects board members", async () => {
    const storage = env.authenticatedContext("admin", { role: "admin" }).storage();
    await assertFails(storage.ref("documents/test.pdf").getMetadata());
    await assertFails(storage.ref("documents/test.pdf").putString("test"));
  });
});
