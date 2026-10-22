/**
 * Client-side URL State serialization and sharing utilities.
 * Encodes tool inputs into URL hash parameters without backend storage.
 */

export function serializeStateToUrl(toolId: string, state: Record<string, unknown>): string {
  try {
    const json = JSON.stringify(state);
    // Safe base64 encoding supporting full UTF-8 Unicode characters
    const encoded = btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    const origin = window.location.origin + window.location.pathname;
    return `${origin}#/app/${toolId}?state=${encodeURIComponent(encoded)}`;
  } catch (err) {
    console.error('Failed to serialize tool state to URL:', err);
    return window.location.href;
  }
}

export function parseSharedState<T extends Record<string, unknown>>(expectedToolId?: string): T | null {
  try {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return null;

    if (expectedToolId) {
      const routePart = hash.slice(0, queryIndex);
      if (!routePart.includes(expectedToolId)) return null;
    }

    const queryStr = hash.slice(queryIndex + 1);
    const params = new URLSearchParams(queryStr);
    const stateParam = params.get('state');

    if (stateParam) {
      const decodedJson = decodeURIComponent(
        Array.prototype.map
          .call(atob(decodeURIComponent(stateParam)), (c: string) =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          )
          .join('')
      );
      return JSON.parse(decodedJson) as T;
    }

    // Fallback: check direct params like ?input=...
    const directObj: Record<string, unknown> = {};
    for (const [k, v] of params.entries()) {
      directObj[k] = v;
    }
    return Object.keys(directObj).length > 0 ? (directObj as T) : null;
  } catch (err) {
    console.warn('Could not parse shared state from URL:', err);
    return null;
  }
}
