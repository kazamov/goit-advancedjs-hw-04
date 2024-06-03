import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { searchImages } from './pixabay-api';

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener(
  'submit',
  async event => {
    event.preventDefault();
    const totalHits = await loadData();

    if (totalHits > 0) {
      iziToast.success({
        title: 'Success',
        message: `Hooray! We found ${totalHits} images.`,
        position: 'topRight',
      });
    }
  },
  false
);

const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.addEventListener('click', loadData, false);
const searchInput = document.querySelector('input[name="searchQuery"]');
searchInput.addEventListener('input', onSearchInput, false);
const searchButton = document.querySelector('button[type="submit"]');
const header = document.querySelector('.header');

let isScrolled = false;
let currentQuery = '';
let currentPage = 1;

function onSearchInput() {
  searchButton.disabled = searchInput.value.trim() === '';
}

function renderGallery(images) {
  const imagesMarkup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
    <div class="photo-card">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" data-large-img-url="${largeImageURL}" class="image" />
      <div class="info">
        <p class="info-item">
          <strong>Likes</strong>
          <span>${likes}</span>
        </p>
        <p class="info-item">
          <strong>Views</strong>
          <span>${views}</span>
        </p>
        <p class="info-item">
          <strong>Comments</strong>
          <span>${comments}</span>
        </p>
        <p class="info-item">
          <strong>Downloads</strong>
          <span>${downloads}</span>
        </p>
      </div>
    </div>
  `;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', imagesMarkup);
}

async function loadData() {
  const searchInputValue = searchInput.value;

  if (searchInputValue !== currentQuery) {
    currentQuery = searchInputValue;
    currentPage = 1;
    hideElement(loadMoreButton);
    gallery.innerHTML = '';
  }

  try {
    const { hits, totalHits } = await searchImages(
      searchInputValue,
      currentPage
    );

    if (hits.length === 0) {
      iziToast.info({
        title: 'Info',
        message:
          'Sorry, there are no images matching your search query. Please try again.',
        position: 'topRight',
      });
      return;
    }

    currentPage += 1;

    renderGallery(hits);

    showElement(loadMoreButton);

    return totalHits;
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images',
      position: 'topRight',
    });

    return 0;
  }
}

function hideElement(element) {
  if (!element.classList.contains('invisible')) {
    element.classList.add('invisible');
  }
}

function showElement(element) {
  if (element.classList.contains('invisible')) {
    element.classList.remove('invisible');
  }
}

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop >= 2 && !isScrolled) {
    header.classList.add('header-scrolled');
    isScrolled = true;
  } else if (scrollTop < 2 && isScrolled) {
    header.classList.remove('header-scrolled');
    isScrolled = false;
  }
});
