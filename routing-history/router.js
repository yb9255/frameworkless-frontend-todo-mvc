const ROUTE_PARAMETER_REGEX = /:(\w+)/g;
const URL_FRAGMENT_REGEX = '([^\\/]+)';
const NAV_A_SELECTOR = 'a[data-navigation]';

function Router() {
  /** @type {ProgrammingRoute[]} */
  const routes = [];

  /** @type {ProgrammingRouter} */
  const router = {};
  let notFound = () => {};
  /** @type { string | undefined } */
  let lastPathname;

  /**
   * @param {ProgrammingRoute} route
   * @param {string} windowHash
   * @returns
   */
  const extractUrlParams = (route, pathname) => {
    if (route.params.length === 0) {
      return {};
    }

    const params = {};

    const matches = pathname.match(route.regex);

    matches.shift();

    matches.forEach((paramValue, index) => {
      const paramName = route.params[index];
      params[paramName] = paramValue;
    });

    return params;
  };

  const checkRoutes = () => {
    const { pathname } = window.location;
    if (lastPathname === pathname) return;

    lastPathname = pathname;

    const currentRoute = routes.find((route) => route.regex.test(pathname));

    if (!currentRoute) {
      notFound();
      return;
    }

    const urlParams = extractUrlParams(currentRoute, pathname);

    currentRoute.component(urlParams);
  };

  router.addRoute = ({ fragment, component }) => {
    const params = [];

    const parsedFragment = fragment
      // :id에서 id를 추출하는 작업
      .replace(ROUTE_PARAMETER_REGEX, (_, paramName) => {
        params.push(paramName);
        // 해당 path variable에 있는 문자 위치에 캡처 그룹 정규식을 넣기 위한 리턴
        return URL_FRAGMENT_REGEX;
      })
      // 세그먼트를 구분하는 / 문자열을 regex 내에서 못쓰니까 \/로 이스케이프 시퀀스로 변경
      .replace(/\//g, '\\/');

    routes.push({
      regex: new RegExp(`^${parsedFragment}$`),
      params,
      component,
    });

    return router;
  };

  router.setNotFound = (cb) => {
    notFound = cb;
    return router;
  };

  router.navigate = (path) => {
    window.history.pushState(null, null, path);
  };

  router.start = () => {
    window.addEventListener('locationchange', checkRoutes);

    document.body.addEventListener('click', (e) => {
      const { target } = e;

      if (target.matches(NAV_A_SELECTOR)) {
        e.preventDefault();
        router.navigate(target.href);
      }
    });

    checkRoutes();
  };

  return router;
}

export default Router;
