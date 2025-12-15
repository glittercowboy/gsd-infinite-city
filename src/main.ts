import { setupScene } from './scene';

const app = document.getElementById('app');
if (!app) {
  throw new Error('App element not found');
}

setupScene(app);
