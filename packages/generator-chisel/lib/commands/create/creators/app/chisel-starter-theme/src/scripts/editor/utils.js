/* global chiselEditorScripts */

class Utils {
  generateIconsChoices = () => {
    const icons = chiselEditorScripts?.icons || null;

    if (!icons) {
      return [];
    }

    const choices = [];

    Object.entries(icons).forEach(([value, label]) => {
      choices.push({
        label,
        value,
      });
    });

    return choices;
  };
}

export default new Utils();
