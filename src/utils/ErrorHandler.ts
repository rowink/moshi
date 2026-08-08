import * as Sentry from "@sentry/vue";
import { warningMsg, statusMsg, statusErrorMsg } from "@/utils/CoolConsole";
import { sessionStorageKeys } from "@/utils/defaults";

/* Makes the current time, like hh:mm:ss */
const makeTime = (): string => {
  const now = new Date();
  const pad = (digit: number) => String(digit).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

/* Appends recent errors to local storage, for viewing in the UI */
const appendToErrorLog = (msg: string) => {
  let errorLog = sessionStorage.getItem(sessionStorageKeys.ERROR_LOG) || "";
  errorLog += `[${makeTime()}] ${msg}\n`;
  sessionStorage.setItem(sessionStorageKeys.ERROR_LOG, errorLog);
};

/**
 * Function called when an error happens
 * Will call to function which prints helpful message to console
 * If error reporting is enabled, will also log the message to Sentry
 * If you wish to use your own error logging service, put code for it here
 */
export const ErrorHandler = function handler(msg: string, errorStack?: unknown) {
  warningMsg(msg, errorStack); // Print to console
  appendToErrorLog(msg); // Save to local storage
  Sentry.captureMessage(`[USER-WARN] ${msg}`); // Report to bug tracker (if enabled)
};

/* Similar to error handler, but for recording general info */
export const InfoHandler = (msg: string, title?: string) => {
  statusMsg(title || "Info", msg);
};

/* Outputs warnings caused by the user, such as missing field */
export const WarningInfoHandler = (msg: string, title?: string, log?: unknown) => {
  statusErrorMsg(title || "Warning", msg, log);
};

/* Titles for info logging */
export const InfoKeys = {
  AUTH: "Authentication",
  EDITOR: "Interactive Editor",
  RAW_EDITOR: "Raw Config Editor",
  VISUAL: "Layout & Styles",
};

export default ErrorHandler;
