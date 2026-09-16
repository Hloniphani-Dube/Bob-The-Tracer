import type { Investigation } from '../types/investigation'

// Static stand in for a real investigation. The investigation page reads
// this directly in pass 1; a later pass swaps it for a fetch to the backend
// and this file goes away.
export const mockInvestigation: Investigation = {
  claim: 'Drinking coffee makes you live longer.',
  verdict: 'partial',
  verdictSummary:
    'Evidence suggests an association in some studies, but the available evidence does not establish that coffee directly causes a longer life.',
  evidenceQuality: 78,
  timeline: [
    { label: 'Claim identified', done: true },
    { label: 'Claim decomposed', done: true },
    { label: '14 sources discovered', done: true },
    { label: '8 relevant sources selected', done: true },
    { label: '5 supporting sources', done: true },
    { label: '2 contradicting sources', done: true },
    { label: '1 misleading interpretation detected', done: true },
    { label: 'Evidence compared', done: true },
  ],
  sources: [
    {
      id: 'src-1',
      title: 'Coffee consumption and mortality in a large prospective cohort',
      type: 'scientific study',
      publishedYear: 2024,
      url: 'https://example.org/studies/coffee-cohort-2024',
      relationship: 'supports',
      strength: 'high',
      excerpt:
        'Researchers observed a lower rate of all cause mortality among moderate coffee drinkers compared to non drinkers, after adjusting for smoking and diet.',
      score: { authority: 88, recency: 90, primaryEvidence: 95, corroboration: 70, relevance: 92 },
    },
    {
      id: 'src-2',
      title: 'Coffee and longevity: a review of observational evidence',
      type: 'research review',
      publishedYear: 2023,
      url: 'https://example.org/reviews/coffee-longevity-review',
      relationship: 'supports',
      strength: 'medium',
      excerpt:
        'Across pooled cohort studies, the association between coffee intake and reduced mortality is consistent but modest, and does not establish a causal mechanism.',
      score: { authority: 82, recency: 80, primaryEvidence: 40, corroboration: 85, relevance: 88 },
    },
    {
      id: 'src-3',
      title: 'Confounding in nutritional epidemiology: the coffee case',
      type: 'scientific article',
      publishedYear: 2022,
      url: 'https://example.org/articles/coffee-confounding',
      relationship: 'contradicts',
      strength: 'medium',
      excerpt:
        'The apparent protective effect of coffee weakens substantially once socioeconomic status and healthcare access are controlled for, suggesting confounding.',
      score: { authority: 79, recency: 65, primaryEvidence: 60, corroboration: 55, relevance: 81 },
    },
    {
      id: 'src-4',
      title: 'Scientists Find Coffee Adds Years to Your Life',
      type: 'news article',
      publishedYear: 2024,
      url: 'https://example.org/news/coffee-adds-years',
      relationship: 'neutral',
      strength: 'low',
      excerpt:
        'The headline reports the cohort study as a settled causal finding, without noting the association only language used by the original researchers.',
      score: { authority: 40, recency: 92, primaryEvidence: 10, corroboration: 30, relevance: 70 },
    },
  ],
  claimDrift: [
    {
      label: 'Original source',
      text: 'The study observed an association between coffee intake and lower mortality risk.',
    },
    {
      label: 'News article',
      text: 'Researchers found a connection between coffee and living longer.',
      changedPhrase: 'connection',
    },
    {
      label: 'Social post',
      text: 'Researchers proved that coffee makes you live longer.',
      changedPhrase: 'proved',
    },
  ],
}
