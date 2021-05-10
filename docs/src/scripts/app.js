/*
  Project: Getchisel
  Author: Xfive
 */

import Prism from 'prismjs';
import Video from './modules/video';
import Sidebar from './modules/sidebar';
import onPageNavigation from './modules/onPageNavigation';
import {} from './helpers/inert';

Prism.highlightAll();

const components = [Video, Sidebar, onPageNavigation];

Promise.resolve(components.forEach((Component) => new Component()));
