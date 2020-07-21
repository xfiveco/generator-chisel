---
title: Code Quality
excerpt: Chisel uses various tools to increase quality of your code
order: 180
---

## [Prettier](https://prettier.io/) - code formatter
Prettier is a code formatter which can automatically format your code when you save file. Your code then automatically conforms to the project's coding standards and passes linter checks.

Prettier comes preinstalled with Chisel and it's synced with Eslint and stylelint (see below). 

One of the easiest ways to use Prettier is to install a plugin for your favourite editor. See *Editor Support* section on [Prettier's homepage](https://prettier.io/).

## [ESLint](https://eslint.org/) - JavaScript linter
ESLint is JavaScript linter which analyze your JavaScript source code for potential errors, stylistic issues, etc. 

## [stylelint](https://stylelint.io/) - CSS linter
stylelint is a CSS linter that helps you avoid errors and enforce consistent conventions in your stylesheets.

## HTML Validation
On the front-end projects, HTML files are valided with [htmlhint](https://github.com/bezoerb/gulp-htmlhint)

## How to tell linters to ignore your code
Linters check the source code when you run `npm run build`. If for any reason you'd like the linters not to check your source code (for example, you are not able to fix the errors), you can do the following:

- add `src` to `.eslintignore` to make ESLint ignore your JavaScript files
- add `src` to `.stylelintignore` to make stylelint ignore your SCSS files  
