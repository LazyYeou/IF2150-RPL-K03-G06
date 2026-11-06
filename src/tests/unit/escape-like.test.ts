import { describe, expect, it } from "vitest";
import { escapeLike } from "@/models/LowonganPekerjaan";

describe("escapeLike", () => {
  it("melindungi %, _ dan backslash", () => {
    expect(escapeLike("50%_off\\")).toBe("50\\%\\_off\\\\");
    expect(escapeLike("biasa")).toBe("biasa");
  });
});
