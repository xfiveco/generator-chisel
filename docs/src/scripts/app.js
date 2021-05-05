/*
  Project: Getchisel
  Author: Xfive
 */

import Prism from 'prismjs';
import Video from './modules/video';

Prism.highlightAll();

const components = [Video];

Promise.resolve(components.forEach((Component) => new Component()));
