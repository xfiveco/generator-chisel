/* global acf, chiselAdminScripts, jQuery */

class ACF {
  constructor() {
    if (typeof acf === 'undefined') {
      return;
    }

    this.acf = acf;

    this.megaMenuData = {
      field: null,
      radios: [],
      submenuFields: [],
      submenuFieldsSelector:
        '.menu-item-depth-0 .acf-field[data-name="mega_menu_default_dropdown"]',
    };

    this.megaMenuFields();

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

  megaMenuFields() {
    jQuery(document).on('menu-item-added', () => {
      this.megaMenuData.submenuFields = document.querySelectorAll(
        this.megaMenuData.submenuFieldsSelector,
      );

      this.setupMegaMenuSubmenuFields();
    });

    this.acf.addAction('ready_field/name=mega_menu_enable', (field) => {
      this.megaMenuData = {
        ...this.megaMenuData,
        field: field.$el[0],
        submenuFields: document.querySelectorAll(this.megaMenuData.submenuFieldsSelector),
      };

      this.megaMenuData.radios = this.megaMenuData.field.querySelectorAll('input[type="radio"]');

      this.setupMegaMenuSubmenuFields(true);
    });
  }

  setupMegaMenuSubmenuFields(registerChangeEvent = false) {
    let isYes = false;

    this.megaMenuData.radios.forEach((radio) => {
      const value = radio.checked ? radio.value : 'no';

      if (value === 'yes') {
        isYes = true;
      }

      if (registerChangeEvent) {
        radio.addEventListener('change', () => {
          const value = radio.checked ? radio.value : 'no';
          this.toggleMegaMenuSubmenuFields(value);
        });
      }
    });

    this.toggleMegaMenuSubmenuFields(isYes ? 'yes' : 'no');
  }

  toggleMegaMenuSubmenuFields(value) {
    this.megaMenuData.submenuFields.forEach((field) => {
      if (value === 'yes') {
        field.classList.remove('acf-hidden');
      } else {
        field.classList.add('acf-hidden');
      }
    });
  }
}

export default new ACF();
