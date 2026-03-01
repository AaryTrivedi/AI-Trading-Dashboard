import { createHash } from 'node:crypto';

const TRACKING_PARAM_KEYS = new Set([
  'fbclid',
  'gclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'mkt_tok',
  'ref',
  'ref_src',
  'si',
  'spm',
  'sr_share',
  'utm_campaign',
  'utm_content',
  'utm_id',
  'utm_medium',
  'utm_name',
  'utm_source',
  'utm_term',
  'ved',
  'yclid',
]);

function isTrackingParam(param: string): boolean {
  if (param.startsWith('utm_')) return true;
  return TRACKING_PARAM_KEYS.has(param);
}

export function canonicalizeUrl(input: string): string {
  const url = new URL(input);
  url.hash = '';

  const keptEntries: Array<[string, string]> = [];
  for (const [key, value] of url.searchParams.entries()) {
    const lowered = key.toLowerCase();
    if (isTrackingParam(lowered)) continue;
    keptEntries.push([key, value]);
  }
  keptEntries.sort(([a], [b]) => a.localeCompare(b));
  url.search = '';
  for (const [key, value] of keptEntries) {
    url.searchParams.append(key, value);
  }

  if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) {
    url.port = '';
  }

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

export function hashCanonicalUrl(canonicalUrl: string): string {
  return createHash('sha256').update(canonicalUrl).digest('hex');
}
