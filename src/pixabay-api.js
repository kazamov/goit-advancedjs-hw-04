import axios from 'axios';

const API_URL = 'https://pixabay.com/api/';
const API_KEY = import.meta.env.VITE_PIXABAY_API_KEY;

export async function searchImages(searchInputValue, page, pageSize) {
  const response = await axios.get(API_URL, {
    params: {
      key: API_KEY,
      q: searchInputValue,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: pageSize,
      page,
    },
  });
  return response.data;
}
