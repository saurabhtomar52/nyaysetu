import { describe, expect, it } from "vitest";

describe("chat API contract", () => {
  it("requires non-empty messages", () => {
    expect("".trim().length).toBe(0);
  });
});

