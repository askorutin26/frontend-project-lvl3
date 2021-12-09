import _ from 'lodash';
import validateURL from './urlValidator';
import makeQueryForRss from './ajax.js';
import parseRSS from './rssParser';

const loadPosts = (state) => {
  const watchedState = state;
  const url = state.formState.currentURL;
  makeQueryForRss(url).then((response) => {
    const rssData = parseRSS(response.data);
    const feedTitle = rssData.title;
    const feedDescription = rssData.description;
    const feedPosts = rssData.postElems;

    const feed = {
      feedTitle,
      feedDescription,
      id: _.uniqueId('feed_'),
    };
    const posts = feedPosts.map((post) => {
      const id = _.uniqueId('post_');
      return { id, post };
    });
    watchedState.feed = feed;
    watchedState.posts = posts;
    watchedState.formState.state = 'finished';
  });
};

export const formHandler = (state, elements) => {
  const watchedState = state;
  const form = elements;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const input = document.querySelector('input');
    const { value } = input;

    const urlArr = watchedState.formState.previousURLS;
    watchedState.formState.currentURL = value;
    watchedState.formState.state = 'processing';

    const validationResult = validateURL(value, urlArr);
    console.log(validationResult);
    if (validationResult === 'valid') {
      watchedState.formState.valid = 'valid';
      watchedState.formState.previousURLS.push(value);
      loadPosts(watchedState, elements);
    } else if (validationResult === 'this must be a valid URL') {
      watchedState.formState.error = 'urlErr';
      watchedState.formState.valid = 'invalid';
    } else {
      watchedState.formState.error = 'alreadyExists';
      watchedState.formState.valid = 'invalid';
    }
  });
};

export const postBtnHandler = (state) => {
  const watchedState = state;
  const watched = [];
  const { posts, modals } = watchedState;
  const buttons = document.querySelectorAll('button[data-bs-toggle="modal"]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = e.target.getAttribute('id');
      watched.push(id);
      modals.currentId = id;
      modals.watchedPosts.push(id);
    });
  });
};
