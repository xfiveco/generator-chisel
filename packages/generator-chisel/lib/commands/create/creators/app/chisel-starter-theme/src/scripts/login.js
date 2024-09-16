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
    this.logoUrl = chiselScripts?.logoUrl;

    if (this.logoUrl) {
      this.setLogoImage();
    }
  }

  setLogoImage() {
    if (this.logo) {
      this.logo.setAttribute('style', `background-image: url("${this.logoUrl}");`);
      this.logo.setAttribute('aria-hidden', 'true');
      this.logo.parentElement.classList.add(this.classnames.loaded);
    }
  }
}

new LoginPage();
