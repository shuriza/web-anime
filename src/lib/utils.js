export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function extractEpisodeNumber(title) {
  const match = title.match(/Episode\s*(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}