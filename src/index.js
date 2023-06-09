//імпортуємо бібліотекі
import './css/style.css';
import Notiflix from 'notiflix';
import { fetchPictures } from "./fetch";
import SimpleLightbox from "simplelightbox";

//отримуемо доступ до елементів
const refs = {
    searchForm: document.querySelector("#search-form"),
    inputEl: document.querySelector("input[name='searchQuery']"),
    btnSubmit: document.querySelector("button[type='submit']"),
    gallery: document.querySelector(".gallery"),
    btnLoad: document.querySelector(".load-more"),
}

//створюємо змінні
let page = 1;
const perPage = 40;
let inputValue = "";
let picturesToShow = 0;

//додаємо слухача
refs.searchForm.addEventListener("submit", onFormSubmit);

//функція отримання запита
async function onFormSubmit(evt) {
    evt.preventDefault();
    inputValue = refs.inputEl.value.trim();
    refs.gallery.innerHTML = "";
    refs.btnLoad.classList.add("is-hiden");
    page = 1;
    if(inputValue === "") {
        Notiflix.Notify.warning("Please, enter something");
        return;
        }
        try {
            const pictures = await fetchPictures(inputValue, page, perPage)
            if (pictures.hits.length === 0) {
                Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
            }
            picturesToShow = pictures.total - pictures.hits.length;
            renderDate(pictures);

            if (pictures.hits.length >= 40) {
            loadMore()
            }
            Notiflix.Notify.success(`Hooray! We found ${pictures.total} images.`);
        
        } catch(error) {
            console.log(error);
        }
        return inputValue;
}

//функція малювання зображень
function renderDate(pictures) {
    const markup = pictures.hits.map((picture) => {
        const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = picture;
        return `<div class="photo-card">
        <a class="gallery__item" href="${largeImageURL}">
    <img src=${webformatURL} alt=${tags} class="gallery__image" height="240" loading="lazy" /></a>
    <div class="info">
        <p class="info-item">
        <b>Likes:</b> ${likes}
        </p>
        <p class="info-item">
        <b>Views:</b> ${views}
        </p>
        <p class="info-item">
        <b>Comments:</b> ${comments}
        </p>
        <p class="info-item">
        <b>Downloads:</b> ${downloads}
        </p>
  </div>
</div>`
    }
    ).join("");
    refs.gallery.insertAdjacentHTML("beforeend", markup);
    galleryLightBox();
    slowLoad();
}

//функція завантаження додаткових зображень
function loadMore() {
    if (picturesToShow > 0) {
        refs.btnLoad.classList.remove("is-hiden");
        page += 1;
        refs.btnLoad.addEventListener("click", onLoadMoreBtnSubmit);
    } else { 
        refs.btnLoad.classList.add("is-hiden");  
        setTimeout(Notiflix.Notify.info("We're sorry, but you've reached the end of search results."), 1000);
    }
}

//функція додавання зображень
async function onLoadMoreBtnSubmit() {
    try {        
        const pictures = await fetchPictures(inputValue, page, perPage);
          
        renderDate(pictures);
        picturesToShow -= pictures.hits.length;
        loadMore();
    } catch(error) {
        console.log(error);        
    }    
}

//функція просмотра галереї
function galleryLightBox() {
    let gallery = new SimpleLightbox('.gallery a', { captionDelay: 250});
    gallery.on('show.simplelightbox');
    gallery.refresh();
}

//функція скрола
function slowLoad() {
    const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 1.2,
        behavior: "smooth",
    });
}
