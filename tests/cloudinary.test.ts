import { describe, expect, it } from "vitest";
import { publicIdFromUrl } from "../src/cloudinary";

describe("publicIdFromUrl", () => {
  it("extracts the public_id from a versioned delivery URL", () => {
    expect(
      publicIdFromUrl("https://res.cloudinary.com/demo/image/upload/v1712/getagent/generated/abc.png"),
    ).toBe("getagent/generated/abc");
  });

  it("handles URLs with no version segment", () => {
    expect(publicIdFromUrl("https://res.cloudinary.com/demo/image/upload/getagent/generated/abc.webp")).toBe(
      "getagent/generated/abc",
    );
  });

  it("returns null for non-Cloudinary URLs", () => {
    expect(publicIdFromUrl("https://example.com/foo/bar.png")).toBe(null);
    expect(publicIdFromUrl("data:image/png;base64,AAAA")).toBe(null);
  });
});
