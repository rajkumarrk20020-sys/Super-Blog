const BASE_IMAGE_URL = import.meta.env.DEV
  ? 'http://localhost:5000'
  : import.meta.env.VITE_API_URL;

if (!import.meta.env.DEV && !BASE_IMAGE_URL) {
  throw new Error('Missing VITE_API_URL. Set VITE_API_URL in your production environment.');
}

const getImageUrl = (image) => {
  if (!image || typeof image !== 'string') return '';
  if (image.startsWith('http')) return image;
  if (image.startsWith('/uploads')) return `${BASE_IMAGE_URL}${image}`;
  return `${BASE_IMAGE_URL}/uploads/${image}`;
};

export default getImageUrl;
