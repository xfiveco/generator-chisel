/* global chiselScripts */

class LoginPage {
  constructor() {
    this.loginPage = document.querySelector('body.login');

    if (!this.loginPage) {
      return;
    }

    this.classnames = {
      loaded: 'has-loaded',
    };

    this.logo = this.loginPage.querySelector('#login h1 a');
    this.logoData = chiselScripts?.logoData;

    if (this.logoData) {
      this.setLogoImage();
    }
  }

  setLogoImage() {
    if (this.logo) {
      const logoWidth = this.logoData[1] > 300 ? 300 : this.logoData[1];
      const logoHeight = this.logoData[2] > 100 ? 100 : this.logoData[2];

      this.logo.setAttribute(
        'style',
        `background-image: url("${this.logoData[0]}");width: ${logoWidth}px;height: ${logoHeight}px;`,
      );
      this.logo.setAttribute('aria-hidden', 'true');
      this.logo.parentElement.classList.add(this.classnames.loaded);
    }
  }
}

new LoginPage();
