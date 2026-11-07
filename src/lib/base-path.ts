/**
 * GitHub Pages serves this project site under /motionfolio/. Moving it to a custom domain or the
 * user-site root is a one-line change here. Set MOTIONFOLIO_BASE_PATH="" to serve from "/".
 */
export const BASE_PATH = process.env.MOTIONFOLIO_BASE_PATH ?? "/motionfolio";
