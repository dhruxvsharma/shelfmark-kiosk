/**
 * Browsing categories, shown as book spines on the home screen.
 * lo/hi are Dewey ranges (hi exclusive). h/w are the spine size in px.
 */
export const CATEGORIES = [
  { key: 'comp', name: 'Computing', lo: 0, hi: 100, zone: 'A', bg: '#F1EDE4', fg: '#0E0E0D', h: 600, w: 79 },
  { key: 'phil', name: 'Philosophy & Psychology', lo: 100, hi: 200, zone: 'A', bg: '#2B3A55', fg: '#F1EDE4', h: 760, w: 93, serif: true },
  { key: 'reli', name: 'Religion & Belief', lo: 200, hi: 300, zone: 'A', bg: '#B9A6D9', fg: '#0E0E0D', h: 640, w: 76 },
  { key: 'soci', name: 'Society & Economics', lo: 300, hi: 500, zone: 'B', bg: '#E2B857', fg: '#0E0E0D', h: 700, w: 86 },
  { key: 'scie', name: 'Science & Nature', lo: 500, hi: 600, zone: 'B', bg: '#3F6E5B', fg: '#F1EDE4', h: 620, w: 83 },
  { key: 'tech', name: 'Typography & Print', lo: 600, hi: 700, zone: 'C', bg: '#E99AAE', fg: '#0E0E0D', h: 680, w: 79, serif: true },
  { key: 'arts', name: 'Arts & Design', lo: 700, hi: 800, zone: 'C', bg: '#0E0E0D', fg: '#F1EDE4', h: 740, w: 101, outline: true },
  { key: 'lite', name: 'Literature', lo: 800, hi: 900, zone: 'D', bg: '#9E2B25', fg: '#F1EDE4', h: 660, w: 83, serif: true },
  { key: 'hist', name: 'History & Travel', lo: 900, hi: 1000, zone: 'D', bg: '#4F6BD8', fg: '#F1EDE4', h: 720, w: 86 },
];
