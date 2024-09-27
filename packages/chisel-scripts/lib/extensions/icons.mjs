import fs from 'fs/promises';
import fastGlob from 'fast-glob';
import path from 'path';
import svgo from 'svgo';
import { chalk } from 'chisel-shared-utils';

const { convertPathToPattern } = fastGlob;

const printLog = (...args) => console.log(chalk.dim('[icons]::'), ...args);

const icons = (api) => {
  const svgSourceFilesDirectory = api.resolve('assets/icons-source');
  const svgSourceFilesDirectoryMono = svgSourceFilesDirectory + '/';
  const svgSourceFilesDirectoryColor = svgSourceFilesDirectory + '/color/';

  const iconsDestinationFolder = api.resolve('assets/icons');
  const iconsJsonFileDestinationFile = iconsDestinationFolder + '/icons.json';
  const iconsFileDestinationFile = iconsDestinationFolder + '/icons.svg';

  const iconsScssSettingsFileDestinationFolder = api.resolve('src/design/settings');
  const iconsScssSettingsFileDestinationFile =
    iconsScssSettingsFileDestinationFolder + '/_icon-settings.scss';

  function optimizeSVG(svgContent, idPrefix, colorfulIcons) {
    const configMono = [
      {
        name: 'removeAttrs',
        params: {
          attrs: ['path:(fill|stroke)', 'fill'],
        },
      },
    ];

    const configColor = [];
    const config = colorfulIcons ? configColor : configMono;

    const result = svgo.optimize(svgContent, {
      removeViewBox: false,
      removeDimensions: false,
      plugins: [
        'preset-default',
        'removeDimensions',
        {
          name: 'prefixIds',
          params: {
            delim: '',
            prefixIds: true,
            prefixClassNames: true,
            prefix: (data) => {
              const prefix =
                data.type === 'element' &&
                data.name === 'use' &&
                data.attributes?.href?.startsWith('#icon-')
                  ? ''
                  : `${idPrefix}__`;
              return prefix;
            },
          },
        },
        ...config,
      ],
    });
    return result.data;
  }

  async function parseSVGFileData(iconSourceFilePath, iconColorful) {
    const iconName = path.basename(iconSourceFilePath, '.svg').replace(/[_|\s]/gm, '-');
    const iconId = iconColorful ? `icon-color-${iconName}` : `icon-${iconName}`;
    const svgContent = await fs.readFile(iconSourceFilePath, 'utf-8');
    const optimizedSvgContent = optimizeSVG(svgContent, iconId, iconColorful);
    const viewBoxMatch = optimizedSvgContent.match(/viewBox=["']([^'|^"]+)["']/);
    const svgViewBox = viewBoxMatch ? viewBoxMatch[1] : null;
    const defsRegex = /<defs>([\s\S]*?)<\/defs>/gm;
    const defsMatches = optimizedSvgContent.matchAll(defsRegex);
    const svgDefsContent = Array.from(defsMatches)
      .map((data) => data[1].trim())
      .join('\n');

    if (!svgViewBox) {
      throw Error(`SVG viewBox not found in file ${iconSourceFilePath}.`);
    }

    const svgWidth = parseInt(svgViewBox.split(' ')[2], 10);
    const svgHeight = parseInt(svgViewBox.split(' ')[3], 10);
    const svgRectangle = svgWidth !== svgHeight;
    const svgIconDataFull = optimizedSvgContent.replace(/<svg[^>]*>|<\/svg>/gi, '').trim();
    const svgIconDataNoDefs = svgIconDataFull.replace(defsRegex, '');

    return {
      iconSourceFilePath,
      iconName,
      iconColorful,
      iconId,
      svgViewBox,
      svgWidth,
      svgHeight,
      svgIconDataFull,
      svgIconDataNoDefs,
      svgDefsContent,
      svgRectangle,
    };
  }

  async function readSVGFilesDataOptimized(sourceDir = svgSourceFilesDirectory, iconsColorful) {
    const sourceDirExists = await fs.access(sourceDir).then(() => true).catch(() => false);
    if (!sourceDirExists) {
      printLog(chalk.yellow(`Path to source SVG files not found!!!`), chalk.italic.underline(sourceDir));
      return [];
    }

    const svgFiles = await fs.readdir(sourceDir);
    const svgFilesDataPromises = svgFiles
      .filter((file) => file.endsWith('.svg'))
      .map((file) => parseSVGFileData(path.join(sourceDir, file), iconsColorful));

    const svgIconsData = await Promise.all(svgFilesDataPromises);
    return svgIconsData;
  }

  async function createDestinationDir() {
    const dirCreation = await fs.mkdir(iconsDestinationFolder, { recursive: true });
    dirCreation && printLog(`Destination directory created:`, chalk.italic.underline(dirCreation));
  }

  async function generateFileContentDataOfSvgIconsMono(svgIconsData) {
    const contentData = {
      defs: ``,
      symbols: ``,
    };

    svgIconsData.forEach((data) => {
      contentData.defs += data.svgDefsContent ? `\t\t${data.svgDefsContent}\n` : '';
      contentData.symbols += `
    <symbol id="${data.iconId}" viewBox="${data.svgViewBox}">
      ${data.svgIconDataNoDefs}
    </symbol>`;
    });

    return contentData;
  }

  async function generateFileContentDataOfSvgIconsColor(svgIconsData) {
    const iconsViewGap = 10;
    const viewBoxMaxWidth = svgIconsData
      .map((data) => data.svgWidth)
      .reduce((max, width) => (width > max ? width : max), 0);

    const contentData = {
      views: ``,
      groups: ``,
      defs: ``,
      viewBoxTotalHeight: 0,
      viewBoxMaxWidth,
    };

    let viewBoxY = 0;

    svgIconsData.forEach((data) => {
      const tmpViewBoxElementPositionY = viewBoxY;
      const tmpViewBoxForView = `0 ${tmpViewBoxElementPositionY} ${data.svgWidth} ${data.svgHeight}`;

      viewBoxY += data.svgHeight + iconsViewGap;
      contentData.viewBoxTotalHeight += data.svgHeight + iconsViewGap;
      contentData.defs += data.svgDefsContent ? `\t\t${data.svgDefsContent}\n` : '';
      contentData.views += `\t<view id="${data.iconId}-view" viewBox="${tmpViewBoxForView}" />\n`;

      contentData.groups += `
  <svg y="${tmpViewBoxElementPositionY}">
    <g id="${data.iconId}">
      ${data.svgIconDataNoDefs}
    </g>
  </svg>`;
    });

    return contentData;
  }

  async function generateIconsFile(svgIconsDataMono, svgIconsDataColor) {
    const contentDataMono = await generateFileContentDataOfSvgIconsMono(svgIconsDataMono);
    const contentDataColor = await generateFileContentDataOfSvgIconsColor(svgIconsDataColor);

    const iconsSVG =
      `
<!-- This file is auto generated. Do not edit directly. -->

<svg version="1.1" viewBox="0 0 ${contentDataColor.viewBoxMaxWidth} ${contentDataColor.viewBoxTotalHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    ${contentDataColor.defs.trim()}
    ${contentDataMono.defs.trim()}
    ${contentDataMono.symbols.trim()}
  </defs>

  ${contentDataColor.views.trim()}

  ${contentDataColor.groups.trim()}
</svg>`.trim() + '\n';

    try {
      await fs.writeFile(iconsFileDestinationFile, iconsSVG, 'utf-8');
      printLog(`Generated SVG icons file: ${chalk.italic.underline(iconsFileDestinationFile)}`);
    } catch (error) {
      throw new Error(`Error generating ${iconsFileDestinationFile}: ${error.message}`);
    }
  }

  async function generateScssSettingsFile(svgIconsData) {
    const scssVariables = svgIconsData
      .filter((data) => data.svgWidth / data.svgHeight !== 1)
      .map((data) => {
        return `
  ${data.iconId}: math.div(${data.svgWidth}, ${data.svgHeight}),`;
      })
      .join('')
      .trim();

    const scssSettingsFileContent =
      `@use 'sass:math';

/* This file is auto generated. Do not edit directly. */

$o-icon-icons: (
  ${scssVariables}
);`.trim() + '\n';

    try {
      await fs.writeFile(iconsScssSettingsFileDestinationFile, scssSettingsFileContent, 'utf-8');
      printLog(`Generated SCSS file: ${chalk.italic.underline(iconsScssSettingsFileDestinationFile)}`);
    } catch (error) {
      throw new Error(`Error generating ${iconsScssSettingsFileDestinationFile}: ${error.message}`);
    }
  }

  async function generateIconsJsonFile(svgIconsData) {
    try {
      const jsonContent = JSON.stringify(svgIconsData, null, 2).trim() + '\n';
      await fs.writeFile(iconsJsonFileDestinationFile, jsonContent, 'utf-8');
      printLog(`Generated JSON icons data file: ${chalk.italic.underline(iconsJsonFileDestinationFile)}`);
    } catch (error) {
      throw new Error(`Error generating ${iconsJsonFileDestinationFile}: ${error.message}`);
    }
  }

  async function generateIconsHTMLPreview(svgIconsDataMono = [], svgIconsDataColor = []) {
    const allIconsData = [...svgIconsDataColor, ...svgIconsDataMono];

    const iconsColorHTML = svgIconsDataColor
      .map((data) => {
        return `
      <div class="element">
        <div class="o-icon o-icon--${data.iconId}">
          <img class="o-icon__icon o-icon__icon--color" src="./icons.svg#${data.iconId}-view" alt="${data.iconId}">
          <!-- <iframe class="o-icon__icon" src="./icons.svg#${data.iconId}-view"></iframe> -->
        </div>
        <p class="element__name" title="Usage name">${data.iconId.replace('icon-', '')}</p>
        <p class="element__id">ID: ${data.iconId}</p>
      </div>`;
      })
      .join('\n').trim();

    const iconsMonoHTML = svgIconsDataMono
      .map((data) => {
        return `
      <div class="element">
        <div class="o-icon o-icon--${data.iconId}">
          <svg class="o-icon__icon">
            <use href="./icons.svg#${data.iconId}"></use>
          </svg>
        </div>
        <p class="element__name" title="Usage name">${data.iconId.replace('icon-', '')}</p>
        <p class="element__id">ID: ${data.iconId}</p>
      </div>`;
      })
      .join('\n').trim();

    const cssClasses = allIconsData
      .filter((data) => data.svgWidth / data.svgHeight !== 1)
      .map((data) => {
        return `\t.o-icon--${data.iconId}{ width: calc(${data.svgWidth / data.svgHeight} * 1em); }\n`;
      })
      .join('')
      .trim();

    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Icons Preview</title>
  <style>
    :root {
      font-size: 62.5%;
    }
    body {
      font-size: 3.6rem;
      background: #f4f4f4;
    }

    h2 {
      display: block;
      margin: 1rem 0;
      width: 100%;
      font-size: 3rem;
    }

    section {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      align-items: center;
      padding: 20px;
    }

    .info {
      font-size: 1.6rem;
      color: #333;
      background: #fff7e3;
      padding: 1rem;
      border: 1px solid #f7d990;
      border-radius: 1rem;
      text-align: center;
    }

    .element {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 1rem;
      background: #fff;
      color: #333;
    }

    .element:hover {
      color: #0073aa;
    }

    .element__name {
      font-family: monospace;
      font-size: 1.4rem;
      color: currentcolor;
      margin: 1.5rem 0 0.5rem;
    }

    .element__id {
      font-family: monospace;
      font-size: 0.9rem;
      color: #999;
      margin: 0.5rem 0 0;
    }

    .o-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1em;
      font-size: var(--o-icon-size, 1em);
    }

    .o-icon__icon {
      display: block;
      width: 100%;
      height: 1em;
      margin: 0;
      padding: 0;
      border: none;
    }

    .o-icon__icon:not(.o-icon__icon--color) {
      fill: currentcolor;
      stroke: currentcolor;
      stroke-width: 0;
    }
    ${cssClasses}
  </style>
  </head>
  <body>
    <!-- Potential issues: https://betravis.github.io/icon-methods/svg-sprite-sheets.html -->
    <p class="info">To properly display this file, it shouldn't be opened directly in the browser, but it should be served.</p>
    <section>
      <h2>Colorful Icons</h2>
      ${iconsColorHTML}
    </section>
    <section>
      <h2>Monochromatic Icons</h2>
      ${iconsMonoHTML}
    </section>
  </body>
  </html>
  `.trim();

    const previewDestinationFolder = `${iconsDestinationFolder}/icons-preview.html`;
    try {
      await fs.writeFile(previewDestinationFolder, htmlContent, 'utf-8');
      printLog(`Generated HTML preview file: ${chalk.italic.underline(previewDestinationFolder)}`);
    } catch (error) {
      throw new Error(`Error generating icons-preview.html: ${error.message}`);
    }
  }

  return async function generateIcons() {
    printLog(chalk.cyanBright('Starting icons files generation'));
    printLog('Path to source SVG files:', chalk.italic.underline(svgSourceFilesDirectory));

    const svgIconsDataMono = await readSVGFilesDataOptimized(svgSourceFilesDirectoryMono, false);
    const svgIconsDataColor = await readSVGFilesDataOptimized(svgSourceFilesDirectoryColor, true);
    const allIconsData = [...svgIconsDataMono, ...svgIconsDataColor];

    if (allIconsData.length === 0) {
      printLog(chalk.yellow('No icons found!!!'));
      printLog(chalk.yellow('Warning: Skipping icons files generation!'));
      return;
    }

    await createDestinationDir();
    await Promise.all([
      generateIconsFile(svgIconsDataMono, svgIconsDataColor),
      generateScssSettingsFile(allIconsData),
      generateIconsJsonFile(allIconsData),
      generateIconsHTMLPreview(svgIconsDataMono, svgIconsDataColor),
    ]);

    printLog(chalk.green('Icons files generated successfully'));
  }
}

export const build = async (api) => {
  await icons(api)();
};

export const start = async (api) => {
  const { default: chokidar } = await import('chokidar');

  const sourceIconsDir = api.resolve('assets/icons-source');
  const pattern = convertPathToPattern(sourceIconsDir) + '/**/*.svg';

  const watcher = chokidar.watch(pattern, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: true,
  });

  watcher.on('add', () => icons(api)());
  watcher.on('change', () => icons(api)());
  watcher.on('unlink', () => icons(api)());
};
