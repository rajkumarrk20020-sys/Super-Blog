const RAW_API_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : import.meta.env.VITE_API_URL;

const BASE_IMAGE_URL = RAW_API_URL?.replace(/\/api\/?$/, '');

if (!import.meta.env.DEV && !RAW_API_URL) {
  throw new Error('Missing VITE_API_URL. Set VITE_API_URL in your production environment.');
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

  console.log({ RAW_API_URL, BASE_IMAGE_URL, image, finalUrl });
  return finalUrl;
};

export default getImageUrl;
