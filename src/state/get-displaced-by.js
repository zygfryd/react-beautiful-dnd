// @flow
import memoizeOne from 'memoize-one';
import { type Position } from 'css-box-model';
import type { Axis, DisplacedBy } from '../types';
import getWritingDirection from '../view/window/get-writing-direction';
import { patch } from './position';

// TODO: memoization needed?
export default memoizeOne(function getDisplacedBy(
  axis: Axis,
  displaceBy: Position,
): DisplacedBy {
  const writingDirection = getWritingDirection();
  const shouldAnimationBeInverted =
    writingDirection === 'rtl' && axis.direction === 'horizontal';

  const displacement: number = shouldAnimationBeInverted
    ? -displaceBy[axis.line]
    : displaceBy[axis.line];
  return {
    value: displacement,
    point: patch(axis.line, displacement),
  };
});
