import createRouter from './router.js';
import createPages from './pages.js';

const container = document.querySelector('main');
const pages = createPages(container);
const router = createRouter();

router
  .addRoute({ fragment: '#/', component: pages.home })
  .addRoute({ fragment: '#/list', component: pages.list })
  .setNotFound(pages.notFound)
  .start();
