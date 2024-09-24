/* global chiselEditorScripts */

class Utils {
  generateClassNamesRegex = (options, classPrefix) => {
    const classNames = options
      .map((option) => option.value)
      .filter((className) => className !== '');

    return new RegExp(`${classPrefix}-(${classNames.join('|')})`, 'gi');
  };

  prepareClassName = (className, classNames) => {
    return className.replace(classNames, '').trim().replace('/[ ]{2,}/g', ' ');
  };

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
