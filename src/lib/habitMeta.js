// The data model stores only { id, name }. For the visual design we derive a
// Material Symbol icon and a category label from keywords in the habit name.
// This is purely cosmetic — nothing is persisted.

const RULES = [
  { re: /(water|drink|hydrate)/i, icon: 'water_drop', category: 'Health', tone: 'secondary' },
  { re: /(read|book|study|learn)/i, icon: 'book', category: 'Mind', tone: 'tertiary' },
  { re: /(meditat|mindful|breath|calm)/i, icon: 'self_improvement', category: 'Mind', tone: 'primary' },
  { re: /(walk|run|jog|steps|cardio|gym|exercise|workout|yoga|stretch)/i, icon: 'directions_run', category: 'Fitness', tone: 'primary' },
  { re: /(sleep|bed|rest)/i, icon: 'bedtime', category: 'Health', tone: 'secondary' },
  { re: /(journal|write|reflect|gratitude)/i, icon: 'edit_note', category: 'Mind', tone: 'tertiary' },
  { re: /(eat|meal|diet|fruit|veg|nutrition)/i, icon: 'restaurant', category: 'Health', tone: 'secondary' },
  { re: /(code|work|study|focus|deep work)/i, icon: 'laptop_mac', category: 'Focus', tone: 'secondary' },
  { re: /(money|save|budget|finance)/i, icon: 'savings', category: 'Finance', tone: 'tertiary' },
  { re: /(call|family|friend|social|connect)/i, icon: 'group', category: 'Social', tone: 'secondary' },
  { re: /(clean|tidy|chore|organi)/i, icon: 'cleaning_services', category: 'Home', tone: 'primary' },
  { re: /(music|practice|guitar|piano|paint|draw|art)/i, icon: 'palette', category: 'Creative', tone: 'tertiary' },
]

const DEFAULT = { icon: 'check_circle', category: 'General', tone: 'primary' }

export function habitMeta(name = '') {
  return RULES.find((r) => r.re.test(name)) || DEFAULT
}

// Tailwind classes for the icon tile, keyed by tone.
export const TONE_TILE = {
  primary: 'bg-primary-container/25 text-primary',
  secondary: 'bg-surface-container text-secondary',
  tertiary: 'bg-tertiary-container/25 text-tertiary',
}
