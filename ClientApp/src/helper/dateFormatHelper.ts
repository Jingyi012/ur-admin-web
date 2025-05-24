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

export const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  }).format(date);
};
