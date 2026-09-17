// Keep this in sync with backend/app/newsdata.py's COUNTRY_OPTIONS: the
// selectable set is deliberately just these, matching what was actually
// configured in newsdata.io's own Query Builder, rather than the full
// country list newsdata.io supports.
export const NEWS_REGIONS = [
  { value: 'all', label: 'All regions' },
  { value: 'za', label: 'South Africa' },
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'cn', label: 'China' },
] as const

export type NewsRegion = (typeof NEWS_REGIONS)[number]['value']
