import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

describe("Contract compilation", () => {
  const managedDir = path.join(projectRoot, "contract", "src", "managed");

  it("managed/ directory exists with compiled circuits", () => {
    expect(fs.existsSync(managedDir)).toBe(true);
    const items = fs.readdirSync(managedDir);
    expect(items.length).toBeGreaterThan(0);
  });

  it("compiled contract file exists", () => {
    const contractFile = path.join(managedDir, "whistleblower", "contract", "index.js");
    expect(fs.existsSync(contractFile)).toBe(true);
    const contents = fs.readFileSync(contractFile, "utf-8");
    expect(contents).toContain("submitFeedback");
    expect(contents).toContain("initialize");
    expect(contents).toContain("authorizationSecret");
  });

  it("circuit proving keys exist", () => {
    const keysDir = path.join(managedDir, "whistleblower", "keys");
    expect(fs.existsSync(keysDir)).toBe(true);
    const files = fs.readdirSync(keysDir);
    const keyFiles = files.filter((f) => f.endsWith(".prover") || f.endsWith(".verifier"));
    expect(keyFiles.length).toBeGreaterThan(0);
  });
});

describe("Contract source", () => {
  it("wrangler.compact exists and contains expected circuits", () => {
    const compactFile = path.join(projectRoot, "contract", "src", "wrangler.compact");
    expect(fs.existsSync(compactFile)).toBe(true);
    const contents = fs.readFileSync(compactFile, "utf-8");
    expect(contents).toContain("circuit initialize");
    expect(contents).toContain("circuit submitFeedback");
  });

  it("contract uses authorize-then-disclose pattern", () => {
    const compactFile = path.join(projectRoot, "contract", "src", "wrangler.compact");
    const contents = fs.readFileSync(compactFile, "utf-8");
    expect(contents).toContain("credential == authorizationSecret");
    expect(contents).toContain("disclose(feedback)");
    expect(contents).toContain("feedbackCount + 1");
  });
});

describe("Witnesses (private state)", () => {
  it("private state is empty (no identity or credential in witness state)", async () => {
    const { createWranglerPrivateState } = await import(
      path.join(projectRoot, "contract", "src", "witnesses.ts")
    );
    const state = createWranglerPrivateState();
    expect(state).toEqual({});
  });

  it("private state is identical across users (credential lives off-chain)", async () => {
    const { createWranglerPrivateState } = await import(
      path.join(projectRoot, "contract", "src", "witnesses.ts")
    );
    expect(createWranglerPrivateState()).toEqual(createWranglerPrivateState());
  });
});

describe("TypeScript API", () => {
  it("common-types exports expected types", async () => {
    const common = await import(path.join(projectRoot, "api", "src", "common-types.ts"));
    expect(common.wranglerPrivateStateKey).toBeDefined();
    expect(typeof common.wranglerPrivateStateKey).toBe("string");
  });

  it("API class is exported", async () => {
    const api = await import(path.join(projectRoot, "api", "src", "index"));
    expect(api.WranglerAPI).toBeDefined();
  });

  it("common-types re-exported from API", async () => {
    const api = await import(path.join(projectRoot, "api", "src", "index"));
    expect(api.wranglerPrivateStateKey).toBeDefined();
  });
});
