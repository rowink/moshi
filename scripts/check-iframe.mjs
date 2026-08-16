#!/usr/bin/env node
/**
 * Check whether a URL can be embedded in an iframe by inspecting the
 * HTTP response headers (X-Frame-Options and CSP frame-ancestors).
 *
 * Usage:
 *   node scripts/check-iframe.mjs <url> [url2 url3 ...]
 *
 * Exit code is 1 if any URL is blocked, so it can be used in CI.
 */

const TIMEOUT_MS = 15000;

function parseArgs() {
  const urls = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));
  if (urls.length === 0) {
    console.error("Usage: node scripts/check-iframe.mjs <url> [url2 url3 ...]");
    process.exit(2);
  }
  return urls;
}

function normalizeUrl(raw) {
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

/**
 * Parse the frame-ancestors directive from a Content-Security-Policy header.
 * Returns null when the directive is absent (no iframe restriction from CSP).
 */
function parseFrameAncestors(csp) {
  const match = csp.match(/frame-ancestors\s+([^;]+)/i);
  if (!match) return null;
  return match[1].trim().split(/\s+/);
}

/**
 * Decide whether the response headers allow cross-origin iframe embedding.
 * Returns { verdict: "pass" | "blocked" | "warning", reason: string }.
 */
function evaluateHeaders(headers) {
  const xfo = headers.get("x-frame-options");
  if (xfo) {
    const value = xfo.trim().toUpperCase();
    if (value === "DENY") {
      return { verdict: "blocked", reason: `X-Frame-Options: ${xfo}` };
    }
    if (value === "SAMEORIGIN") {
      return {
        verdict: "blocked",
        reason: `X-Frame-Options: ${xfo} (only same-origin embedding allowed)`,
      };
    }
    return {
      verdict: "warning",
      reason: `X-Frame-Options: ${xfo} (unrecognized value)`,
    };
  }

  const csp = headers.get("content-security-policy");
  if (csp) {
    const ancestors = parseFrameAncestors(csp);
    if (ancestors) {
      if (ancestors.includes("'none'")) {
        return { verdict: "blocked", reason: "CSP frame-ancestors 'none'" };
      }
      if (ancestors.includes("*")) {
        return { verdict: "pass", reason: "CSP frame-ancestors *" };
      }
      return {
        verdict: "blocked",
        reason: `CSP frame-ancestors ${ancestors.join(" ")} (only listed origins allowed)`,
      };
    }
  }

  return { verdict: "pass", reason: "no iframe-blocking headers found" };
}

async function checkUrl(rawUrl) {
  const url = normalizeUrl(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "moshi-iframe-check/1.0" },
    });

    const { verdict, reason } = evaluateHeaders(response.headers);
    const status = `${response.status} ${response.statusText}`.trim();
    const finalUrl = response.url || url;

    let icon;
    if (verdict === "pass") icon = "✅";
    else if (verdict === "blocked") icon = "❌";
    else icon = "⚠️";

    console.log(`${icon} ${url}`);
    console.log(`   status: ${status}`);
    if (finalUrl !== url) console.log(`   redirects to: ${finalUrl}`);
    console.log(`   verdict: ${verdict.toUpperCase()} - ${reason}`);
    console.log("");
    return verdict === "blocked" ? "blocked" : verdict;
  } catch (error) {
    const reason =
      error.name === "AbortError"
        ? `request timed out after ${TIMEOUT_MS / 1000}s`
        : error.cause?.code || error.message;
    console.log(`❌ ${url}`);
    console.log(`   error: ${reason}`);
    console.log("");
    return "blocked";
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const urls = parseArgs();
  const results = await Promise.all(urls.map(checkUrl));

  const passed = results.filter((r) => r === "pass").length;
  const warnings = results.filter((r) => r === "warning").length;
  const blocked = results.filter((r) => r === "blocked").length;

  console.log("─".repeat(50));
  console.log(
    `Summary: ${passed}/${urls.length} can be embedded, ${warnings} warning(s), ${blocked} blocked`,
  );
  if (blocked > 0) process.exitCode = 1;
}

main();
