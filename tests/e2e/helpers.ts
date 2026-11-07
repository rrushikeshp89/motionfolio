import type { Page } from "@playwright/test";

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 768;
export const isDesktopWide = (page: Page) => (page.viewportSize()?.width ?? 1280) >= 1024;
