/* A Netlify cloud function for the status check feature.
 * Uses only Node built-ins (https/http) so it has zero external
 * dependencies and cannot fail to bundle on Netlify. */
const https = require('https');
const http = require('http');

/* Determines if successful from the HTTP response code */
const getResponseType = (code, validCodes) => {
  if (validCodes && String(validCodes).includes(String(code))) return true;
  if (Number.isNaN(code)) return false;
  const numericCode = parseInt(code, 10);
  return (numericCode >= 200 && numericCode <= 302);
};

/* Makes human-readable response text for successful check */
const makeMessageText = (data) => `${data.successStatus ? '✅' : '⚠️'} `
  + `${data.serverName || 'Server'} responded with `
  + `${data.statusCode} - ${data.statusText}. `
  + `\n⏱️Took ${data.timeTaken} ms`;

/* Makes human-readable response text for failed check */
const makeErrorMessage = (data) => `❌ Service Unavailable: ${data.hostname || 'Server'} `
  + `resulted in ${data.code || 'a fatal error'} ${data.errno ? `(${data.errno})` : ''}`;

const makeErrorMessage2 = (data) => '❌ Service Error - '
  + `${data.status} - ${data.statusText}`;

/* Kicks off a HTTP request, then formats and renders results */
const makeRequest = (url, options, render) => {
  const {
    headers, enableInsecure, acceptCodes, maxRedirects,
  } = options;
  const validCodes = acceptCodes && acceptCodes !== 'null' ? acceptCodes : null;
  const startTime = new Date();
  const redirectLimit = parseInt(maxRedirects, 10) > 0 ? parseInt(maxRedirects, 10) : 5;

  const doRequest = (targetUrl, redirectsLeft) => {
    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.request(parsed, {
      method: 'GET',
      headers,
      rejectUnauthorized: !enableInsecure,
      timeout: 8000,
    }, (response) => {
      const { statusCode, statusMessage } = response;
      const location = response.headers.location;
      if ([301, 302, 303, 307, 308].includes(statusCode) && location && redirectsLeft > 0) {
        response.resume();
        const nextUrl = new URL(location, targetUrl).toString();
        doRequest(nextUrl, redirectsLeft - 1);
        return;
      }
      const successStatus = getResponseType(statusCode, validCodes);
      const results = {
        statusCode,
        statusText: statusMessage,
        serverName: parsed.hostname,
        successStatus,
        timeTaken: (new Date() - startTime),
      };
      results.message = makeMessageText(results);
      response.resume();
      render(JSON.stringify(results));
    });
    req.on('timeout', () => {
      req.destroy(new Error('ETIMEDOUT'));
    });
    req.on('error', (error) => {
      const response = error.response || {};
      const returnCode = response.status || error.code;
      if (validCodes && String(validCodes).includes(returnCode)) { // Success overridden by user
        const results = {
          successStatus: getResponseType(returnCode, validCodes),
          statusCode: returnCode,
          statusText: response.statusText,
          timeTaken: (new Date() - startTime),
        };
        results.message = makeMessageText(results);
        render(JSON.stringify(results));
      } else { // Request failed
        render(JSON.stringify({
          successStatus: false,
          message: error.response ? makeErrorMessage2(error.response) : makeErrorMessage(error),
        }));
      }
    });
    req.end();
  };

  doRequest(url, redirectLimit);
};

const decodeHeaders = (maybeHeaders) => {
  if (!maybeHeaders) return {};
  const decodedHeaders = decodeURIComponent(maybeHeaders);
  let parsedHeaders = {};
  try {
    parsedHeaders = JSON.parse(decodedHeaders);
  } catch (e) { /* Not valid JSON, will just return false */ }
  return parsedHeaders;
};

/* Returned if the URL param is not present or correct */
const immediateError = (render) => {
  render(JSON.stringify({
    successStatus: false,
    message: '❌ Missing or Malformed URL',
  }));
};

/* Main function, will check if a URL present, and call function */
const statusCheck = (paramStr, render) => {
  if (!paramStr || !paramStr.includes('=')) {
    immediateError(render);
  } else {
    // Prepare the parameters, which are got from the URL
    const params = new URLSearchParams(paramStr);
    const url = decodeURIComponent(params.get('url'));
    const acceptCodes = decodeURIComponent(params.get('acceptCodes'));
    const maxRedirects = decodeURIComponent(params.get('maxRedirects')) || 0;
    const headers = decodeHeaders(params.get('headers'));
    const enableInsecure = !!params.get('enableInsecure');
    if (!url || url === 'undefined') immediateError(render);
    const options = {
      headers, enableInsecure, acceptCodes, maxRedirects,
    };
    makeRequest(url, options, render);
  }
};

exports.handler = (event, context, callback) => {
  const paramStr = event.rawQuery;
  statusCheck(paramStr, (results) => {
    callback(null, {
      statusCode: 200,
      body: results,
    });
  });
};