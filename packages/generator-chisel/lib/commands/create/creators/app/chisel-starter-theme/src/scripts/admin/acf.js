/* global acf, chiselAdminScripts */

class ACF {
  constructor() {
    if (typeof acf === 'undefined') {
      return;
    }

    this.acf = acf;

    this.acf.addAction('ready', () => {
      this.customColorsPalette();
    });
  }

  customColorsPalette() {
    this.acf.addFilter('color_picker_args', (args) => {
      const newArgs = args;

      newArgs.palettes = chiselAdminScripts.acfColorPickerPalette;

      return newArgs;
    });
  }
}

export default new ACF();
