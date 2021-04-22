// @flow
import getWritingDirection from './get-writing-direction';

export default (): 'left' | 'right' => {
  const writingDirection = getWritingDirection();
  return writingDirection === 'ltr' ? 'left' : 'right';
};
