import type { PopupContent } from '@/domains/Operation/types';

const INITIAL_POPUP_DISPLAY_PRIORITY = 10;
const POPUP_DISPLAY_PRIORITY_STEP = 10;

function comparePopupDisplayOrder(
  firstPopup: PopupContent,
  secondPopup: PopupContent
) {
  const priorityDifference =
    firstPopup.displayPriority - secondPopup.displayPriority;

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  const createdAtDifference = firstPopup.createdAt.localeCompare(
    secondPopup.createdAt
  );

  if (createdAtDifference !== 0) {
    return createdAtDifference;
  }

  return firstPopup.id - secondPopup.id;
}

export function getNextPopupDisplayPriority(popups: PopupContent[]) {
  if (popups.length === 0) {
    return INITIAL_POPUP_DISPLAY_PRIORITY;
  }

  const maximumPriority = Math.max(
    ...popups.map((popup) => popup.displayPriority)
  );

  return maximumPriority + POPUP_DISPLAY_PRIORITY_STEP;
}

export function sortPopupsByDisplayOrder(popups: PopupContent[]) {
  return [...popups].sort(comparePopupDisplayOrder);
}

export function getVisiblePopupsForDate(
  popups: PopupContent[],
  referenceDate: string
) {
  const visiblePopups = popups.filter(
    (popup) =>
      popup.startDate <= referenceDate && referenceDate <= popup.endDate
  );

  return sortPopupsByDisplayOrder(visiblePopups);
}
