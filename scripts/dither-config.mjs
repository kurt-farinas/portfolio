import { projectDetails, gearCatalogData, snapshotsDeckData } from '../src/data/projectData.js';

// CSS bounds include the 1200px image viewer. Larger exports keep UI text useful.
export const imageConfig = [
  ...Object.values(projectDetails).flatMap(project => project.slides.map(slide => ({
    source: '/' + slide.src.replace(/^\//, ''), group: 'projects', cssWidth: 1200,
    exportWidth: 1200, reason: '600px export lost interface labels; raised to 1200px without cropping',
  }))),
  ...gearCatalogData.flatMap(item => (item.images || []).map(image => ({
    source: image.src, group: 'personal', cssWidth: 1200,
    optional: image.src === '/images/outside/mchose-ace60-detail.jpg',
  }))),
  ...snapshotsDeckData.map(image => ({ source: image.src, group: 'personal', cssWidth: 1200 })),
  { source: '/profile.jpg', group: 'personal', cssWidth: 280 },
];
export const bayer8 = [
  [0,48,12,60,3,51,15,63], [32,16,44,28,35,19,47,31],
  [8,56,4,52,11,59,7,55], [40,24,36,20,43,27,39,23],
  [2,50,14,62,1,49,13,61], [34,18,46,30,33,17,45,29],
  [10,58,6,54,9,57,5,53], [42,26,38,22,41,25,37,21],
];
