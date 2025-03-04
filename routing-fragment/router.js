function Router() {
  /** @type {Route[]} */
  const routes = [];

  /** @type {Router} */
  const router = {};
  let notFound = () => {};

  const checkRoutes = () => {
    const currentRoute = routes.find((route) => {
      return route.fragment === window.location.hash;
    });

    if (!currentRoute) {
      notFound();
      return;
    }

    currentRoute.component();
  };

  router.addRoute = ({ fragment, component }) => {
    routes.push({
      fragment,
      component,
    });

    return router;
  };

  router.setNotFound = (cb) => {
    notFound = cb;
    return router;
  };

  router.start = () => {
    window.addEventListener('hashchange', checkRoutes);

    if (!window.location.hash) {
      window.location.hash = '#/';
    }

    checkRoutes();
  };

  return router;
}

export default Router;
