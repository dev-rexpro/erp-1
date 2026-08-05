/**
 * List of available font names (visit the url `/settings/appearance`).
 * This array is used to generate dynamic font classes (e.g., `font-inter`, `font-manrope`).
 *
 * 📝 How to Add a New Font (Tailwind v4+):
 * 1. Add the font name here.
 * 2. Update the `<link>` tag in 'index.html' to include the new font from Google Fonts (or any other source).
 * 3. Add the new font family to 'theme.css' using the `@theme inline` and `font-family` CSS variable.
 */
export const fonts = [
  'inter',
  'notoSans',
  'nunitoSans',
  'figtree',
  'roboto',
  'raleway',
  'dmSans',
  'publicSans',
  'outfit',
  'manrope',
  'geist',
  'geistMono',
  'jetBrainsMono',
  'notoSerif',
  'robotoSlab',
  'merriweather',
  'lora',
  'playfairDisplay',
] as const

export type Font = (typeof fonts)[number]

export const fontLabels: Record<Font, string> = {
  inter: 'Inter',
  notoSans: 'Noto Sans',
  nunitoSans: 'Nunito Sans',
  figtree: 'Figtree',
  roboto: 'Roboto',
  raleway: 'Raleway',
  dmSans: 'DM Sans',
  publicSans: 'Public Sans',
  outfit: 'Outfit',
  manrope: 'Manrope',
  geist: 'Geist',
  geistMono: 'Geist Mono',
  jetBrainsMono: 'JetBrains Mono',
  notoSerif: 'Noto Serif',
  robotoSlab: 'Roboto Slab',
  merriweather: 'Merriweather',
  lora: 'Lora',
  playfairDisplay: 'Playfair Display',
}
