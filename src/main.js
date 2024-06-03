import iziToast from 'izitoast';
import SimpleLightbox from 'simplelightbox';

import 'izitoast/dist/css/iziToast.min.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { searchImages } from './pixabay-api';

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('submit', onFormSubmit, false);

const gallery = document.querySelector('.gallery');

const searchInput = document.querySelector('input[name="searchQuery"]');
searchInput.addEventListener('input', onSearchInput, false);

const searchButton = document.querySelector('button[type="submit"]');
const header = document.querySelector('.header');

let isScrolled = false;
let shownRecords = 0;
let currentPage = 1;
const pageSize = 40;

const lightbox = new SimpleLightbox('.gallery a', {});
const intersectionObserver = new IntersectionObserver(handleIntersection, {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
});

function handleIntersection(entries, _observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadData();
    }
  });
}

function onSearchInput() {
  searchButton.disabled = searchInput.value.trim() === '';
}

async function onFormSubmit(event) {
  event.preventDefault();

  currentPage = 1;
  gallery.innerHTML = '';

  const totalHits = await loadData();

  if (totalHits > 0) {
    iziToast.success({
      title: 'Success',
      message: `Hooray! We found ${totalHits} images.`,
      position: 'topRight',
    });
  }
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
        <a href="${largeImageURL}" class="card-link">
          <div class="photo-card">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" class="image" />
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
        </a>
  `;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', imagesMarkup);
}

async function loadData() {
  const searchInputValue = searchInput.value;

  try {
    const { hits, totalHits } = await searchImages(
      searchInputValue,
      currentPage,
      pageSize
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

    renderGallery(hits);
    lightbox.refresh();

    shownRecords += hits.length;
    currentPage += 1;

    const lastElement = gallery.lastElementChild;
    if (lastElement) {
      intersectionObserver.observe(lastElement);
    }

    if (shownRecords >= totalHits) {
      intersectionObserver.disconnect();
      iziToast.info({
        title: 'Info',
        message: `We're sorry, but you've reached the end of search results.`,
        position: 'topRight',
      });
    }

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
