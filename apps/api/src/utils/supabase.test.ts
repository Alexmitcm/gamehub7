import { describe, expect, it } from "vitest";
import { supabase } from "./supabase";

describe("Supabase Client", () => {
  it("should connect to Supabase successfully", async () => {
    // Test basic connection by checking if we can access the auth service
    const { data, error } = await supabase.auth.getSession();

    // Should not throw an error
    expect(error).toBeNull();

    // Should return data (even if no session)
    expect(data).toBeDefined();
  });

  it("should have correct environment variables", () => {
    expect(process.env.SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_KEY).toBeDefined();
    expect(process.env.SUPABASE_URL).toContain("supabase.co");
  });
});
