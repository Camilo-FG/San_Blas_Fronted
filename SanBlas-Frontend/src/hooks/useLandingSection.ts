import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import type { LandingSectionKey } from "../services/landingService";

async function fetchLandingSection<T extends Record<string, unknown>>(
  sectionKey: LandingSectionKey,
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/landing/${sectionKey}`);
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: T };
    return payload.data ?? null;
  } catch {
    return null;
  }
}

export function useLandingSection<T extends Record<string, unknown>>(
  sectionKey: LandingSectionKey,
  fallback: T,
  options?: { defer?: boolean },
) {
  const [data, setData] = useState<T>(fallback);
  const defer = options?.defer ?? false;

  useEffect(() => {
    let active = true;

    const cargar = async () => {
      const section = await fetchLandingSection<T>(sectionKey);
      if (!active || !section) return;

      const merged = { ...fallback, ...section };
      setData((current) =>
        JSON.stringify(current) === JSON.stringify(merged) ? current : merged,
      );
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const programarCarga = () => {
      if (defer && "requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(
          () => {
            if (active) void cargar();
          },
          { timeout: 2500 },
        );
        return;
      }

      timeoutId = setTimeout(
        () => {
          if (active) void cargar();
        },
        defer ? 1200 : 0,
      );
    };

    programarCarga();

    return () => {
      active = false;
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [sectionKey, defer]);

  return { data };
}
