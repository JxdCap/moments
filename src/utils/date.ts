export const formatMomentTime = (value: string) => {
  const date = new Date(value);
  const now = new Date();
  const delta = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  if (delta < minute) {
    return '刚刚';
  }

  if (delta < hour) {
    return `${Math.floor(delta / minute)}分钟前`;
  }

  if (delta < day) {
    return `${Math.floor(delta / hour)}小时前`;
  }

  if (delta < 7 * day) {
    return `${Math.floor(delta / day)}天前`;
  }

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDuration = (seconds?: number) => {
  if (!seconds) {
    return '';
  }

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};
