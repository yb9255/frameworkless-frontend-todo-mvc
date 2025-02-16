import createRouter from './router.js';
import createPages from './pages.js';
import './location-change-polyfill.js';

const NAV_BTN_SELECTOR = 'button[data-navigate]';

const container = document.querySelector('main');
const pages = createPages(container);
const router = createRouter();

router
  .addRoute({ fragment: '/', component: pages.home })
  .addRoute({ fragment: '/list', component: pages.list })
  .addRoute({ fragment: '/list/:id', component: pages.detail })
  .addRoute({
    fragment: '/list/:id/:anotherId',
    component: pages.anotherDetail,
  })
  .setNotFound(pages.notFound)
  .start();

document.body.addEventListener('click', (e) => {
  const { target } = e;

  if (target.matches(NAV_BTN_SELECTOR)) {
    const { navigate } = target.dataset;
    router.navigate(navigate);
  }
});
