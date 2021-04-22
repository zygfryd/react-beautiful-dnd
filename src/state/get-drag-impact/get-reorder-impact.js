// @flow
import { type Rect } from 'css-box-model';
import type {
  Axis,
  DisplacedBy,
  DisplacementGroups,
  DraggableDimension,
  DraggableId,
  DragImpact,
  DroppableDimension,
  LiftEffect,
  Viewport,
} from '../../types';
import getDisplacedBy from '../get-displaced-by';
import removeDraggableFromList from '../remove-draggable-from-list';
import isHomeOf from '../droppable/is-home-of';
import { find } from '../../native-with-fallback';
import getDidStartAfterCritical from '../did-start-after-critical';
import calculateReorderImpact from '../calculate-drag-impact/calculate-reorder-impact';
import getIsDisplaced from '../get-is-displaced';
import getWritingDirection from '../../view/window/get-writing-direction';

type Args = {|
  pageBorderBoxWithDroppableScroll: Rect,
  draggable: DraggableDimension,
  destination: DroppableDimension,
  insideDestination: DraggableDimension[],
  last: DisplacementGroups,
  viewport: Viewport,
  afterCritical: LiftEffect,
|};

type AtIndexArgs = {|
  draggable: DraggableDimension,
  closest: ?DraggableDimension,
  inHomeList: boolean,
|};

function atIndex({ draggable, closest, inHomeList }: AtIndexArgs): ?number {
  if (!closest) {
    return null;
  }

  if (!inHomeList) {
    return closest.descriptor.index;
  }

  if (closest.descriptor.index > draggable.descriptor.index) {
    return closest.descriptor.index - 1;
  }

  return closest.descriptor.index;
}

export default ({
  pageBorderBoxWithDroppableScroll: targetRect,
  draggable,
  destination,
  insideDestination,
  last,
  viewport,
  afterCritical,
}: Args): DragImpact => {
  const axis: Axis = destination.axis;
  const displacedBy: DisplacedBy = getDisplacedBy(
    destination.axis,
    draggable.displaceBy,
  );
  const displacement: number = displacedBy.value;

  const targetStart: number = targetRect[axis.start()];
  const targetEnd: number = targetRect[axis.end()];

  const withoutDragging: DraggableDimension[] = removeDraggableFromList(
    draggable,
    insideDestination,
  );

  const closest: ?DraggableDimension = find(
    withoutDragging,
    (child: DraggableDimension): boolean => {
      const id: DraggableId = child.descriptor.id;
      const childCenter: number = child.page.borderBox.center[axis.line];

      const didStartAfterCritical: boolean = getDidStartAfterCritical(
        id,
        afterCritical,
      );

      const isDisplaced: boolean = getIsDisplaced({ displaced: last, id });

      // console.log(destination.axis);

      const writingDirection = getWritingDirection();
      const shouldAnimationBeInverted =
        writingDirection === 'rtl' &&
        destination.axis.direction === 'horizontal';
      /*
      Note: we change things when moving *past* the child center - not when it hits the center
      If we make it when we *hit* the child center then there can be
      a hit on the next update causing a flicker.

      - Update 1: targetBottom hits center => displace backwards
      - Update 2: targetStart is now hitting the displaced center => displace forwards
      - Update 3: goto 1 (boom)
    */
      // console.log('************', {targetStart,targetEnd, childCenter, displacement});
      if (didStartAfterCritical) {
        // Continue to displace while targetEnd before the childCenter
        // Move once we *move forward past* the childCenter
        if (isDisplaced) {
          // console.log('Jestem 1');
          return shouldAnimationBeInverted
            ? targetEnd >= childCenter
            : targetEnd <= childCenter;
        }

        // Has been moved backwards from where it started
        // Displace forwards when targetStart *moves backwards past* the displaced childCenter
        // console.log('Jestem 2, zmieniam się w pionie');
        return shouldAnimationBeInverted
          ? targetStart > childCenter + displacement
          : targetStart < childCenter - displacement;
      }

      // Item has been shifted forward.
      // Remove displacement when targetEnd moves forward past the displaced center
      if (isDisplaced) {
        // console.log(isDisplaced);
        return shouldAnimationBeInverted
          ? targetEnd >= childCenter - displacement
          : targetEnd <= childCenter + displacement;
      }

      // Item is behind the dragging item
      // We want to displace it if the targetStart goes *backwards past* the childCenter
      // console.log('Jestem 4, pojawiam sie w momencie przejscia');
      return shouldAnimationBeInverted
        ? targetStart > childCenter
        : targetStart < childCenter;
    },
  );

  console.log({
    draggable,
    closest,
    inHomeList: isHomeOf(draggable, destination),
  });

  const newIndex: ?number = atIndex({
    draggable,
    closest,
    inHomeList: isHomeOf(draggable, destination),
  });

  // TODO: index cannot be null?
  // otherwise return null from there and return empty impact
  // that was calculate reorder impact does not need to account for a null index
  return calculateReorderImpact({
    draggable,
    insideDestination,
    destination,
    viewport,
    last,
    displacedBy,
    index: newIndex,
  });
};
