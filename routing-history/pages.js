/** @param {Node} container */
export default (container) => {
  const home = () => {
    container.textContent = 'This is Home page';
  };

  const list = () => {
    container.textContent = 'This is List Page';
  };

  const notFound = () => {
    container.textContent = 'Page Not Found!';
  };

  /** @param {DetailParams | undefined} params */
  const detail = (params) => {
    const { id } = params;

    container.textContent = `This is Detail Page with Id ${id}`;
  };

  /** @param {AnotherDetailParams | undefined} params */
  const anotherDetail = (params) => {
    const { id, anotherId } = params;

    container.textContent = `This is another Detail Page with Id ${id} and AnotherId ${anotherId}`;
  };

  return {
    home,
    list,
    notFound,
    detail,
    anotherDetail,
  };
};
