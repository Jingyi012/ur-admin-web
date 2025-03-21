export const formatDateToYYYYMMDD = (dateString: any) => {
  if (!dateString) return null;

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.error('Invalid date input:', dateString);
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
