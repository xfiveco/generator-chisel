---
title: Front-end Templates Setup
excerpt: How to setup front-end templates with Chisel
order: 60
---

## 1. Create project directory
Create a new project directory and change your working directory to it. You can use the following commands on the command line:

```bash
mkdir project-name
cd project-name
```

## 2. Run Chisel
Run Chisel from the project directory

```bash
yo chisel
```

Insert project name (you can use the default one based on the working directory name), author and select *Front-end Templates* project type. Select whether you want to use jQuery and wait until installation completes.

*Note: To speedup installation process we recommend using [Yarn](https://yarnpkg.com/en/). Chisel will automatically detect it and run if possible. Otherwise it falls back to default NPM install*

## 3. Setting up an existing project
If you are joining development of an existing front-end project which was already set up with Chisel, you don't have to set it up again. Follow these steps:

1. Clone repository
2. Run `npm install` or `yarn`
3. Run `npm run build` and `npm run dev`
