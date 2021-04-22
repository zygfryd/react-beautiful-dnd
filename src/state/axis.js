// @flow
import type { HorizontalAxis, VerticalAxis } from '../types';
import getStartSide from '../view/window/get-start-side';
import getEndSide from '../view/window/get-end-side';

export const vertical: VerticalAxis = {
  direction: 'vertical',
  line: 'y',
  crossAxisLine: 'x',
  start: () => 'top',
  end: () => 'bottom',
  size: 'height',
  crossAxisStart: () => getStartSide(),
  crossAxisEnd: () => getEndSide(),
  crossAxisSize: 'width',
};

export const horizontal: HorizontalAxis = {
  direction: 'horizontal',
  line: 'x',
  crossAxisLine: 'y',
  start: () => getStartSide(),
  end: () => getEndSide(),
  size: 'width',
  crossAxisStart: () => 'top',
  crossAxisEnd: () => 'bottom',
  crossAxisSize: 'height',
};
