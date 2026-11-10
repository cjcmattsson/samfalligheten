import { readFileSync } from "node:fs";
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, describe, it } from "vitest";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-ostergardshus",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
    storage: { rules: readFileSync("storage.rules", "utf8") },
  });
});

afterAll(async () => {
  await env.cleanup();
});

describe("Firestore denies by default", () => {
  it("rejects anonymous reads", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(db.collection("members").doc("test").get());
  });

  it("rejects anonymous writes", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(db.collection("members").doc("test").set({ name: "Test" }));
  });

  it("rejects signed-in users on collections without an explicit rule", async () => {
    const db = env.authenticatedContext("some-user").firestore();
    await assertFails(db.collection("unknown").doc("test").get());
  });
});

describe("Storage denies by default", () => {
  it("rejects anonymous reads", async () => {
    const storage = env.unauthenticatedContext().storage();
    await assertFails(storage.ref("documents/test.pdf").getMetadata());
  });

  it("rejects signed-in users on paths without an explicit rule", async () => {
    const storage = env.authenticatedContext("some-user").storage();
    await assertFails(storage.ref("unknown/test.pdf").getMetadata());
  });
});
