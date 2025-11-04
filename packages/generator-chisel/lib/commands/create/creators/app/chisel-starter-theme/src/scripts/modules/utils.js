/* global chiselScripts */

class Utils {
  ajaxRequest = async (action, ajaxData = {}, ajaxParams = {}, ajaxHeaders = {}) => {
    const {
      ajax: { url, nonce },
    } = chiselScripts;

    let formData;

    if (ajaxData instanceof FormData) {
      formData = ajaxData;
    } else {
      formData = new FormData();

      Object.entries(ajaxData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && !['file', 'files'].includes(key)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
    }

    const params = {
      method: 'POST',
      headers: {
        'X-WP-Nonce': nonce, // this authenticates users and allows using get_current_user functions in rest api endpoints
        ...ajaxHeaders,
      },
      credentials: 'same-origin',
      ...ajaxParams,
    };

    if (params.method === 'POST') {
      params.body = formData;
    }

    const endpoint = `${url}/${action}`;

    const response = await fetch(endpoint, params);

    if (!response.ok) {
      throw new Error('An error occurred');
    }

    const data = await response.json();

    return data;
  };
}

export default new Utils();
