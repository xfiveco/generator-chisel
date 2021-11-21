/*
  Project: Getchisel
  Author: Xfive
 */

import hljs from 'highlight.js';
import {} from './helpers/inert';

import Sidebar from './modules/sidebar';
import onPageNavigation from './modules/onPageNavigation';

hljs.highlightAll();

const components = [Sidebar, onPageNavigation];

Promise.resolve(components.forEach((Component) => new Component()));
