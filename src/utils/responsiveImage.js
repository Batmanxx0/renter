/**
 * Builds responsive <img> props (src/srcSet/sizes) for a listing photo.
 *
 * Unsplash's image API accepts a `w` query param and returns an
 * appropriately-sized, re-compressed image, so we can request several
 * widths and let the browser pick the best one for the device -- instead
 * of every phone downloading the same fixed 800x600 image meant for a
 * desktop card.
 *
 * Falls back to a plain `src` for any non-Unsplash URL (e.g. images
 * later uploaded to Supabase Storage) so this never breaks other sources.
 *
 * @param {string} url - the base image URL
 * @param {string} [sizes] - the CSS `sizes` attribute for this image slot
 * @returns {{ src: string, srcSet?: string, sizes?: string }}
 */
export function getResponsiveImageProps(url, sizes = '(max-width: 767px) 92vw, 460px') {
  if (!url) return { src: url }

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return { src: url }
  }

  if (parsed.hostname !== 'images.unsplash.com') {
    return { src: url }
  }

  const widths = [400, 600, 800, 1000, 1200]
  const srcSet = widths
    .map((w) => {
      const variant = new URL(parsed.toString())
      variant.searchParams.set('w', w)
      variant.searchParams.set('q', '75')
      variant.searchParams.set('fit', 'crop')
      variant.searchParams.set('auto', 'format')
      return `${variant.toString()} ${w}w`
    })
    .join(', ')

  return { src: url, srcSet, sizes }
}
