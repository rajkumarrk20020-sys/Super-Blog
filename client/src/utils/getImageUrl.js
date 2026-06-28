const RAW_API_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.__SMARTBLOG_API_URL__) || null);

const BASE_IMAGE_URL = RAW_API_URL ? RAW_API_URL.replace(/\/api\/?$/, '') : (typeof window !== 'undefined' ? window.location.origin : '');

if (!import.meta.env.DEV && !RAW_API_URL) {
  // Don't throw during runtime; instead warn and fall back to current origin.
  // Note: For correct production behavior, set VITE_API_URL at build time to your backend origin.
  // eslint-disable-next-line no-console
  console.warn('getImageUrl: VITE_API_URL not set at build time. Using', BASE_IMAGE_URL);
}

const getImageUrl = (image) => {
  if (!image || typeof image !== 'string') {
    if (import.meta.env.DEV) {
      console.warn('getImageUrl: invalid image value', image);
    }
    return '';
  }

  const trimmedImage = image.trim();
  if (!trimmedImage) return '';

  let finalUrl = trimmedImage;
  if (/^https?:\/\//i.test(trimmedImage)) {
    finalUrl = trimmedImage;
  } else {
    const normalizedImage = trimmedImage.replace(/^\/api\/?/, '/');
    const sanitizedPath = normalizedImage.replace(/^\/+/, '');
    const imagePath = sanitizedPath.startsWith('uploads/')
      ? sanitizedPath
      : `uploads/${sanitizedPath}`;

    finalUrl = `${BASE_IMAGE_URL}/${imagePath}`;
  }

  return finalUrl;
};

export default getImageUrl;
