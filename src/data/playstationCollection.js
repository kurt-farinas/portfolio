// Games selected by Kurt. Cover scans are original North American PS1 editions.
const sourceRoot = 'https://github.com/libretro-thumbnails/Sony_-_PlayStation/blob/master/Named_Boxarts/';
export const playstationCollection = [
  ['tekken-3', 'Tekken 3', 'Tekken 3 (USA).png'],
  ['resident-evil', 'Resident Evil', 'Resident Evil (USA).png'],
  ['final-fantasy-vii', 'Final Fantasy VII', 'Final Fantasy VII (USA).png'],
  ['metal-gear-solid', 'Metal Gear Solid', 'Metal Gear Solid (USA).png']
].map(([id, title, file]) => ({ id, title, image: `/images/playstation/${id}.webp`, source: sourceRoot + encodeURIComponent(file) }));
