(function () {
  var endpoint = 'https://gameofbones-admin.vercel.app/api/save-order';
  window.GobCheckoutTransport = Object.freeze({
    saveOrder: function (payload) {
      return fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true
      }).then(function (response) {
        if (!response.ok) throw new Error(response.status === 409 ? 'Order reference conflict' : 'HTTP ' + response.status);
        return response.json();
      }).then(function (body) { return body.order || []; });
    }
  });
}());
