// Canonical list of blog categories used across the app
export const CATEGORIES = [
  'Study in the UK',
  'Course & Career Guides',
  'Application & Admissions',
  'Scholarships & Funding',
  'Student Life',
  'Visa & Immigration',
  'Partner Universities & Success Stories',
  'UAPP Platform & Tools',
  'Regional Insights',
  'Education News & Updates',
] as const

export type Category = typeof CATEGORIES[number]

export function getCategories(): string[] {
  return [...CATEGORIES]
}
