// @flow
export default (): 'ltr' | 'rtl' => {
  const body = document.querySelector('body');
  if (!window) {
    return 'ltr';
  }
  return window.getComputedStyle(body).direction;
};
