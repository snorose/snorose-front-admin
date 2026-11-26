export function sanitizeMarkdownUrl(url: string) {
  const value = url.trim();
  if (
    !value ||
    /[\s\\]/u.test(value) ||
    Array.from(value).some(
      (character) =>
        character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127
    )
  )
    return '';
  const address = value.replace(/^https?:\/\//i, '');
  if (
    !/^(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[\p{L}]{2,}(?::\d+)?(?:[/?#]|$)/u.test(
      address
    )
  )
    return '';
  try {
    const result = new URL(`https://${address}`);
    return result.protocol === 'https:' && !result.username && !result.password
      ? `https://${address}`
      : '';
  } catch {
    return '';
  }
}

export function isAllowedMarkdownUrl(url: string) {
  return sanitizeMarkdownUrl(url) !== '';
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
