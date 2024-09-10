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

    this.setLogoImage();
  }

  setLogoImage() {
    if (this.logo) {
      this.logo.setAttribute('style', `background-image: url("${chiselScripts.logoUrl}");`);
      this.logo.setAttribute('aria-hidden', 'true');
      this.logo.parentElement.classList.add(this.classnames.loaded);
    }
  }
}

new LoginPage();
