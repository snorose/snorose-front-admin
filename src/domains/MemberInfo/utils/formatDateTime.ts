export const formatDateTime = (dateTimeString?: string | null) => {
  if (!dateTimeString) return '';

  if (!dateTimeString.includes('T')) return dateTimeString;

  // YYYY-MM-DDTHH:MM:SS.... -> [YYYY-MM-DD, HH:MM:SS....]
  const [date, timeWithMs] = dateTimeString.split('T');

  // HH:MM:SS.... -> HH:MM:SS
  const time = timeWithMs.split('.')[0];

  return `${date} ${time}`;
};
