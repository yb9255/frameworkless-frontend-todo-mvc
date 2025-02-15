const ROUTE_PARAMETER_REGEX = /:(\w+)/g;
const URL_FRAGMENT_REGEX = '([^\\/]+)';

function Router() {
  /** @type {ProgrammingRoute[]} */
  const routes = [];

  /** @type {ProgrammingRouter} */
  const router = {};
  let notFound = () => {};

  /**
   * @param {ProgrammingRoute} route
   * @param {string} windowHash
   * @returns
   */
  const extractUrlParams = (route, windowHash) => {
    if (route.params.length === 0) {
      return {};
    }

    const params = {};

    const matches = windowHash.match(route.regex);

    matches.shift();

    matches.forEach((paramValue, index) => {
      const paramName = route.params[index];
      params[paramName] = paramValue;
    });

    return params;
  };

  const checkRoutes = () => {
    const { hash } = window.location;

    const currentRoute = routes.find((route) => route.regex.test(hash));

    if (!currentRoute) {
      notFound();
      return;
    }

    const urlParams = extractUrlParams(currentRoute, window.location.hash);

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

  router.navigate = (fragment) => {
    window.location.hash = fragment;
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
