import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bankPayout,
  midtransRequest,
  rupiah,
} from "@/lib/payment/midtrans-http";

afterEach(() => vi.unstubAllGlobals());
describe("Midtrans HTTP boundary", () => {
  it.each([
    new TypeError("fetch failed: sensitive upstream details"),
    new DOMException("aborted upstream request", "AbortError"),
    new DOMException("timeout upstream request", "TimeoutError"),
  ])(
    "network/abort failures become a safe gateway-uncertain error: $name",
    async (error) => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));
      const failure = await midtransRequest(
        "https://example.invalid",
        "dummy",
      ).catch((value) => value);
      expect(failure).toMatchObject({ code: "GATEWAY_UNCERTAIN", status: 502 });
      expect(failure.message).not.toContain(error.message);
    },
  );
  it("missing key stays a configuration error and never calls fetch", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(
      midtransRequest("https://example.invalid", ""),
    ).rejects.toMatchObject({ code: "GATEWAY_CONFIG", status: 503 });
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([
    { bank: "bca" },
    { beneficiary_bank: "bca" },
    { bank: "bca", beneficiary_bank: "bca" },
  ])("normalizes the native bank field and compatible alias: %j", (data) => {
    expect(bankPayout(data)).toBe("bca");
  });
  it.each([{}, { bank: 123 }, { bank: "bca", beneficiary_bank: "bni" }])(
    "missing or contradictory bank fields are rejected: %j",
    (data) => {
      expect(() => bankPayout(data)).toThrow(
        expect.objectContaining({ code: "GATEWAY_UNCERTAIN", status: 502 }),
      );
    },
  );
  it("keeps amount validation strict: valid IDR strings only", () => {
    expect(rupiah("10000.00")).toBe(10000);
    for (const value of [10000, "10000.01", "NaN", "9007199254740993"])
      expect(() => rupiah(value)).toThrow(
        expect.objectContaining({ code: "GATEWAY_UNCERTAIN" }),
      );
  });
});
