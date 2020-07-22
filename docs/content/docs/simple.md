---
title: In simple terms
excerpt: Some of the concepts behind Chisel and similar tools can be difficult to understand at first. We'll try to explain them in simple terms here. So grab your coffee and let's get to it.
order: 2000
---

## What is Chisel?

Chisel is like an **automatic coffee machine** which can produce different types of coffees. When you get Chisel (i.e., when you [install it on your computer](/docs/installation)), you can set up different types of projects with it, namely WordPress projects or front-end templates projects.

## How do I work with Chisel?

Chisel doesn't have any shiny buttons to press, it is controlled from the [command line](https://webdesign.tutsplus.com/articles/the-command-line-for-web-design-introduction--cms-23493). The basic command is `yo chisel`. You typically run it in an empty folder where you want to set up your new project.

## How does Chisel know what kind of coffee... er, project, I want?

When you run it, it will ask you a few questions, like what project type you want to set up, among others.

## How does Chisel create my project files?

Like a coffee machine with different types of coffees or other ingredients in it, Chisel is installed in your computer with ingredients for your project. These are templates of various project files. Depending on your answers during the project setup, it takes some of these templates, customizes them and create new project files from them.

## Why does Chisel install something for the project yet?

Each project set up with Chisel comes with a bunch of useful tools to automate common web development tasks like browser reloading, CSS minification, etc. The exact list of these tools depends on your project type and answers during the setup and is stored in the file called `package.json`. So when Chisel ends setting up your project files, it will take a look at the list of these tools and installs them.

## Can I change the project type when it's already setup?

No, when you got your espresso or latte, you cannot put it back to the machine to make it something different. However, if you know what you are doing, you could improve it, maybe with a bit of milk or cinnamon.

Similarly, once Chisel sets up the project, you cannot change the project type. You could do some customization to the project by adding new tools to it or customizing the existing ones, but it's not something you usually have to do. Chisel produces delicious projects out-of-box.

## I've got a Chisel project from a developer and I'd like to continue working on that. What should I do?

1. First, [install Chisel](/docs/installation)
2. Next, set up a project:

- [WordPress project](/docs/setup/wordpress) - scroll down to _Setting up an existing project_
- [Front-end templates](/docs/setup/frontend) - scroll down to _Setting up an existing project_

3. If you have trouble installing Chisel or setting up a project, [submit an issue](https://github.com/xfiveco/generator-chisel/issues) at GitHub with a label `question` or write us to the e-mail [chisel@xfive.co](mailto:chisel@xfive.co). We are happy to help.

## I've got a Chisel project from a developer, but I'm fan of good old CSS and HTML.

The good old HTML & CSS, who wouldn't like those, right? However, we recommend that you give Chisel a chance, install it and setup the existing project so you can use power and flexibility of modern development workflow. See the previous question for how to do that.

If you still would like to work with CSS and HTML directly, they are stored in the `dist` folder. Chisel automatically creates unminified CSS, the file name looks somewhat like `main-ec2b29e0f7.full.css`. Unfortunately, there is no reasonable way how to work with JavaScript files in the `dist` folder directly.

**Beware, once you edit HTML or CSS in the `dist` folder, you or other developers shouldn't use [standard project workflow and tasks](/docs/development/tasks) anymore.** The standard development workflow overrides content of `dist` folder so you could lose your changes.

For the full overview and comparison of old school vs. modern development workflow check out [this article](https://www.xfive.co/blog/craft-perfect-websites-chisel/).

## What if I have a problem with Chisel installation or Chisel project?

[Submit an issue](https://github.com/xfiveco/generator-chisel/issues) at GitHub with a label `question` or write us to the e-mail [chisel@xfive.co](mailto:chisel@xfive.co). We are happy to help.
