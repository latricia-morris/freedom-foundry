import { describe, expect, it } from "vitest";
import { getIntuitTid, inspectQuickBooksResponse, sanitizeSupportDetails } from "./logger";

describe("QuickBooks support logging", () => {
  it("captures intuit_tid case-insensitively from a provider response", () => {
    const event = inspectQuickBooksResponse(
      { status: 429, headers: new Headers({ intuit_tid: " tid-123 " }) },
      { error: "rate limited", access_token: "must not persist" },
      { method: "GET", path: "/quickbooks/company" },
    );

    expect(event).toMatchObject({
      provider: "quickbooks",
      provider_status: 429,
      intuit_tid: "tid-123",
      safe_response_details: { error: "rate limited", access_token: "[redacted]" },
    });
  });

  it("supports node-style header records and redacts credential-shaped keys", () => {
    expect(getIntuitTid({ IntUiT_TiD: ["tid-456"] })).toBe("tid-456");
    expect(sanitizeSupportDetails({
      authorization: "Bearer private",
      nested: { refresh_token: "private", status: "failed" },
    })).toEqual({
      authorization: "[redacted]",
      nested: { refresh_token: "[redacted]", status: "failed" },
    });
  });
});