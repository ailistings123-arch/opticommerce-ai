/**
 * Decode HTML entities to plain text
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '...')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&[a-z]+;/gi, ''); // Remove any remaining entities
}
