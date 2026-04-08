export type MediaGridLayout = {
  variant: 'single' | 'double' | 'quad' | 'grid';
  columns: number;
};

export const getMediaGridLayout = (count: number): MediaGridLayout => {
  if (count <= 1) {
    return { variant: 'single', columns: 1 };
  }

  if (count === 2) {
    return { variant: 'double', columns: 2 };
  }

  if (count === 4) {
    return { variant: 'quad', columns: 2 };
  }

  return { variant: 'grid', columns: 3 };
};
