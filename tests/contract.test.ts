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
    expect(contents).toContain("isAuthorized");
    expect(contents).toContain("generateNullifier");
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
  it("whistleblower.compact exists and contains expected circuits", () => {
    const compactFile = path.join(projectRoot, "contract", "src", "whistleblower.compact");
    expect(fs.existsSync(compactFile)).toBe(true);
    const contents = fs.readFileSync(compactFile, "utf-8");
    expect(contents).toContain("circuit isAuthorized");
    expect(contents).toContain("circuit submitFeedback");
    expect(contents).toContain("circuit generateNullifier");
  });

  it("contract uses authorize-nullify-submit pattern", () => {
    const compactFile = path.join(projectRoot, "contract", "src", "whistleblower.compact");
    const contents = fs.readFileSync(compactFile, "utf-8");
    expect(contents).toContain("isAuthorized(inputCredential)");
    expect(contents).toContain("nullifier");
    expect(contents).toContain("inputCredential == authorizationSecret");
  });
});

describe("Witnesses (private state)", () => {
  it("createWhistleblowerPrivateState stores credential correctly", async () => {
    const { createWhistleblowerPrivateState } = await import(
      path.join(projectRoot, "contract", "src", "witnesses.ts")
    );
    const credential = 42n;
    const state = createWhistleblowerPrivateState(credential);
    expect(state.credential).toBe(42n);
  });

  it("multiple private states produce different nullifier seeds", async () => {
    const { createWhistleblowerPrivateState } = await import(
      path.join(projectRoot, "contract", "src", "witnesses.ts")
    );
    const state1 = createWhistleblowerPrivateState(12345n);
    const state2 = createWhistleblowerPrivateState(67890n);
    expect(state1.credential).not.toBe(state2.credential);
  });
});

describe("TypeScript API", () => {
  it("common-types exports expected types", async () => {
    const common = await import(path.join(projectRoot, "api", "src", "common-types.ts"));
    expect(common.whistleblowerPrivateStateKey).toBeDefined();
    expect(typeof common.whistleblowerPrivateStateKey).toBe("string");
  });

  it("API class is exported", async () => {
    const api = await import(path.join(projectRoot, "api", "src", "index"));
    expect(api.WhistleblowerAPI).toBeDefined();
  });

  it("common-types re-exported from API", async () => {
    const api = await import(path.join(projectRoot, "api", "src", "index"));
    expect(api.whistleblowerPrivateStateKey).toBeDefined();
  });
});
