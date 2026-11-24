/**
 * Simple ranked search over title, author, subject and call number.
 * Every word typed must match somewhere for a book to appear.
 */
import { BOOKS, zoneName } from './catalogue.js';

const normalise = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Words that map to Dewey prefixes, so "typography" finds 686.x books. */
const SUBJECT_HINTS = {
  typography: ['686'],
  type: ['686'],
  graphic: ['741'],
  history: ['9'],
  indian: ['954'],
  novels: ['741.5', '823'],
};

export function searchBooks(query) {
  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  return BOOKS.map((b) => {
    const title = normalise(b.title);
    const author = normalise(b.author);
    const haystack = normalise([b.title, b.author, b.category.name, zoneName(b.zone), b.call, b.summary].join(' '));
    let score = 0;
    for (const t of terms) {
      if (title.includes(t)) score += 5;
      if (author.includes(t)) score += 4;
      if (haystack.includes(t)) score += 1;
      if (SUBJECT_HINTS[t]?.some((p) => b.call.startsWith(p))) score += 2;
    }
    return { b, score };
  })
    .filter((x) => x.score >= terms.length)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.b);
}
