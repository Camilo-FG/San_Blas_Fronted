import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LandingSectionKey } from "../services/landingService";
import { obtenerSeccionLanding } from "../services/landingService";

export function useLandingSection<T extends Record<string, unknown>>(
  sectionKey: LandingSectionKey,
  fallback: T,
  options?: { defer?: boolean },
) {
  const defer = options?.defer ?? false;
  const [ready, setReady] = useState(!defer);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (!defer) {
      setReady(true);
      return;
    }

    if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(
          () => {
            setReady(true);
          },
          { timeout: 2500 },
        );
    } else {
      timeoutId = setTimeout(() => setReady(true), 1200);
    }

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, [defer]);

  const { data: section, isFetched, isError, isSuccess } = useQuery({
    queryKey: ["landing", sectionKey],
    queryFn: () => obtenerSeccionLanding<T>(sectionKey),
    enabled: ready,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
  });

  /** true cuando el fetch de la sección terminó (éxito o error). */
  const isSettled = ready && (isFetched || isError || isSuccess);

  return { data: { ...fallback, ...section?.data }, isSettled };
}
