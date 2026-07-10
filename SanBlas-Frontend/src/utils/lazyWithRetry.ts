import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type ModuleDefault<T> = { default: T };

export function lazyWithRetry<T extends ComponentType>(
  importer: () => Promise<ModuleDefault<T>>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      const retryKey = "lazy-import-retry";
      const hasRetried = sessionStorage.getItem(retryKey);

      if (!hasRetried) {
        sessionStorage.setItem(retryKey, "1");
        window.location.reload();
        return { default: (() => null) as unknown as T };
      }

      sessionStorage.removeItem(retryKey);
      throw error;
    }
  });
}
