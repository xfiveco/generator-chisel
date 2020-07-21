---
title: ITCSS
excerpt: ITCSS stands for Inverted Triangle CSS and it helps you make project CSS scalable and maintainable.
order: 150
---

One of the key principles of ITCSS is that it separates your CSS codebase to several sections (called layers) which take form of the inverted triangle. These layers are present in Chisel as following folders inside the `src/styles` folder:

## `settings`
Used with preprocessors and contain font, colors definitions, etc.

## `tools`
Globally used mixins and functions. It’s important not to output any CSS in the first two layers.
   
## `generic`
Reset and/or normalize styles, box-sizing definition, etc. This is the first layer which generates actual CSS.

## `elements`
Styling for bare HTML elements (like H1, A, etc.). These come with default styling from the browser so you can redefine them here.

## `objects`
class-based selectors which define undecorated design patterns, for example media object known from OOCSS

## `components`
Specific UI components. This is where majority of your work takes place and our UI components are often composed of Objects and Components

## `utilities`
Utilities and helper classes with ability to override anything which goes before in the triangle, eg. hide helper class

## `vendor`
Chisel's addition to the original ITCSS structure. This is where you can place vendor's specific CSS. 

## `main.scss`
Main file where other stylesheets are imported, do not write styles directly to this file.

When starting to work with ITCSS in Chisel, try to follow existing code structure and examples.

For more detailed introduction to ITCSS, check out the blog post [ITCSS: Scalable and Maintainable CSS Architecture](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
