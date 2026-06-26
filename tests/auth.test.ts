import { describe, expect, it } from "vitest";
import { isLeaderRole } from "../src/auth";

describe("isLeaderRole", () => {
  it("is true only for Manager and Lead Builder", () => {
    expect(isLeaderRole("Manager")).toBe(true);
    expect(isLeaderRole("Lead Builder")).toBe(true);
  });

  it("is false for everyone else", () => {
    for (const r of ["Member", "Trainee", "Core Builder", "", "manager"]) {
      expect(isLeaderRole(r)).toBe(false);
    }
  });
});
