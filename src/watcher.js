import onChange from 'on-change';
import i18n from 'i18next';
import { setLocale } from 'yup';
import _ from 'lodash';
import {
  renderForm, renderFeed, renderModal, renderPostBlock,
} from './view.js';
import {
  formHandler, postHandler,
} from './handler.js';
import locales from './locales/locales.js';
import makeQueryForRss from './ajax.js';
import parseRSS from './rssParser.js';

const app = () => {
  const initState = {
    formState: {
      currentURL: '',
      state: 'filling',
      error: '',
    },
    feeds: [],
    posts: [],
    modals: {
      clickedId: '',
      watchedPosts: new Set(),
    },
  };
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    fallbackLng: 'ru',
    debug: true,
    resources: locales,
    detection: {
      order: ['queryString', 'cookie'],
      cache: ['cookie'],
    },
    interpolation: {
      escapeValue: false,
    },

  }).then(() => {
    setLocale({
      mixed: {
        notOneOf: 'alreadyExists',
      },
      string: {
        url: 'invalidURL',
      },
    });
    const formContainer = document.querySelector('.rss-form');
    const modalContainer = document.querySelector('div.modal.fade');
    const feedsContainer = document.querySelector('div .feeds');
    const postsContainer = document.querySelector('div .posts');
    const rssContainer = document.querySelector('.rss-container');

    const updateFeed = (feed, watchedState) => {
      const { url, id } = feed;
      const { posts } = watchedState;
      const promise = makeQueryForRss(url);
      promise.then((result) => {
        const rssData = parseRSS(result.data.contents);
        const { rssTitle, postElems } = rssData;
        const oldPosts = _.filter(posts, { feedTitle: rssTitle });
        const diff = _.differenceBy(postElems, oldPosts, 'title');
        const newPosts = diff.map((post) => ({
          feedID: id,
          feedTitle: rssTitle,
          postId: _.uniqueId('post_'),
          ...post,
        }));
        posts.unshift(...newPosts);
      });
    };

    const updateRss = (appState, timeout) => {
      const stateToWatch = appState;
      const { feeds } = stateToWatch;
      const promises = feeds.map((feed) => updateFeed(feed, stateToWatch));
      Promise.all(promises).finally(setTimeout(updateRss, timeout, stateToWatch, timeout));
    };

    const watchedState = onChange(initState, (path) => {
      console.log(path);
      switch (path) {
        case 'formState.state':
          renderForm(formContainer, watchedState, i18nInstance);
          break;
        case 'feeds':
          renderFeed(feedsContainer, watchedState, i18nInstance);
          break;
        case 'posts':
        case 'modals.watchedPosts':
          renderPostBlock(postsContainer, watchedState, i18nInstance);
          break;
        case 'modals.clickedId':
          renderModal(modalContainer, watchedState);
          break;
        default:
          break;
      }
    });
    formHandler(watchedState, formContainer);
    postHandler(watchedState, rssContainer);
    updateRss(watchedState, 5000);
  });
};

export default app;
