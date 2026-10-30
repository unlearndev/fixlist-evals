import { describe, expect, it } from "vitest";
import { buildUserMessage } from "../src/triage/prompt.ts";
import type { Property } from "../src/triage/schema.ts";

const property: Property = {
  id: "P-99",
  address: "1 Test Street",
  type: "1-bed flat",
  toilets: 1,
  heating: "gas combi boiler",
  gasSupply: true,
  vulnerableTenant: false,
  tenant: { name: "Test Tenant", phone: "07700 900999", email: "test@example.com" },
};

describe("buildUserMessage", () => {
  it("includes the report text inside report tags", () => {
    const message = buildUserMessage(
      { text: "The tap is dripping.", channel: "email", receivedAt: "2026-10-01T09:00:00Z" },
      property,
    );
    expect(message).toContain("<report>\nThe tap is dripping.\n</report>");
  });

  it("says how the report arrived", () => {
    const message = buildUserMessage(
      { text: "No hot water.", channel: "phone", receivedAt: "2026-10-01T09:00:00Z" },
      property,
    );
    expect(message).toContain("Report (phone call, typed up by staff)");
  });

  it("never sends the tenant's contact details", () => {
    const message = buildUserMessage(
      { text: "No hot water.", channel: "form", receivedAt: "2026-10-01T09:00:00Z" },
      property,
    );
    expect(message).not.toContain("07700 900999");
    expect(message).not.toContain("test@example.com");
  });
});
