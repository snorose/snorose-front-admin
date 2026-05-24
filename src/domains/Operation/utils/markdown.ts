const ALLOWED_MARKDOWN_URL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'tel:',
]);

function normalizeUrlForProtocolCheck(url: string) {
  return Array.from(url.trim())
    .filter((character) => {
      const charCode = character.charCodeAt(0);

      return charCode > 31 && charCode !== 127 && !/\s/.test(character);
    })
    .join('')
    .toLowerCase();
}

export function isAllowedMarkdownUrl(url: string) {
  const normalizedUrl = normalizeUrlForProtocolCheck(url);

  if (!normalizedUrl) {
    return false;
  }

  if (
    normalizedUrl.startsWith('/') ||
    normalizedUrl.startsWith('./') ||
    normalizedUrl.startsWith('../') ||
    normalizedUrl.startsWith('#')
  ) {
    return !normalizedUrl.startsWith('//');
  }

  const protocolMatch = normalizedUrl.match(/^[a-z][a-z\d+.-]*:/);

  if (!protocolMatch) {
    return true;
  }

  return ALLOWED_MARKDOWN_URL_PROTOCOLS.has(protocolMatch[0]);
}

export function sanitizeMarkdownUrl(url: string) {
  return isAllowedMarkdownUrl(url) ? url : '';
}

export function extractMarkdownUrls(markdown: string) {
  const urls: string[] = [];
  const markdownLinkPattern =
    /!?\[[^\]]*]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g;
  const autoLinkPattern = /<((?:[a-z][a-z\d+.-]*:)[^>\s]+)>/gi;

  for (const match of markdown.matchAll(markdownLinkPattern)) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }

  for (const match of markdown.matchAll(autoLinkPattern)) {
    if (match[1]) {
      urls.push(match[1]);
    }
  }

  return urls;
}
