/* global chiselScripts */

class Utils {
  // Kept outside chiselScripts so a nonce refreshed by the server survives for later requests.
  currentNonce = chiselScripts?.ajax?.nonce ?? '';

  ajaxRequest = async (action, ajaxData = {}, ajaxParams = {}, ajaxHeaders = {}) => {
    const {
      ajax: { url },
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

    const endpoint = `${url}/${action}`;

    const request = (nonce) => {
      const params = {
        method: 'POST',
        headers: {
          // this authenticates users and allows using get_current_user functions in rest api endpoints
          ...(nonce ? { 'X-WP-Nonce': nonce } : {}),
          ...ajaxHeaders,
        },
        credentials: 'same-origin',
        ...ajaxParams,
      };

      if (params.method === 'POST') {
        params.body = formData;
      }

      return fetch(endpoint, params);
    };

    let response = await request(this.currentNonce);

    // A page served from a full-page cache can carry a nonce older than its lifetime,
    // which WordPress rejects with 403. Retry once unauthenticated - public endpoints
    // still answer, they just lose the current-user context.
    if (response.status === 403 && this.currentNonce) {
      this.currentNonce = '';
      response = await request('');
    }

    if (!response.ok) {
      throw new Error('An error occurred');
    }

    // WordPress returns a refreshed nonce on every authenticated REST response.
    const refreshedNonce = response.headers.get('X-WP-Nonce');

    if (refreshedNonce) {
      this.currentNonce = refreshedNonce;
    }

    const data = await response.json();

    return data;
  };
}

export default new Utils();
