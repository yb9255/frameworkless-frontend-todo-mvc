const { faker } = window;

/**
 * @returns {{ text: string, completed: boolean }}
 */
const createElement = () => ({
  text: faker.random.words(2),
  completed: faker.random.boolean(),
});

/**
 * @param {() => { text: string, completed: boolean }} elementFactory
 * @param {number} number
 * @returns {Array<{ text: string, completed: boolean }>}
 */
const repeat = (elementFactory, number) => {
  const array = [];

  for (let index = 0; index < number; index++) {
    array.push(elementFactory());
  }

  return array;
};

export default () => {
  const howMany = faker.random.number(10);

  if (typeof howMany === 'number') {
    return repeat(createElement, howMany);
  } else {
    return [];
  }
};
