(() => {
  let oldPushState = history.pushState;

  history.pushState = (...args) => {
    let ret = oldPushState.apply(history, args);
    dispatchEvent(new CustomEvent('pushstate'));
    dispatchEvent(new CustomEvent('locationchange'));

    return ret;
  };

  let oldReplaceState = history.replaceState;

  history.replaceState = (...args) => {
    let ret = oldReplaceState.apply(history, args);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });
})();
