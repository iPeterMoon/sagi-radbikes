// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "@/lib/api/auth";
import { fakeResponse } from "../helpers/mocks";

describe("authApi.logout (jsdom)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("usuario", "pedro");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("limpia el usuario de localStorage tras cerrar sesión", async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ status: 204, json: () => Promise.resolve(undefined) }),
    );

    await authApi.logout();

    expect(localStorage.getItem("usuario")).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
