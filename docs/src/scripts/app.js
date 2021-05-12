/*
  Project: Getchisel
  Author: Xfive
 */

import hljs from 'highlight.js';
import {} from './helpers/inert';

import Video from './modules/video';
import Sidebar from './modules/sidebar';
import onPageNavigation from './modules/onPageNavigation';

hljs.highlightAll();

const components = [Video, Sidebar, onPageNavigation];

Promise.resolve(components.forEach((Component) => new Component()));
