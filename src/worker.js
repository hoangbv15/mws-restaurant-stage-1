onmessage = function(e) {
  var m = e.data;
  fetch(m.url, {
    body: JSON.stringify(m.data), // must match 'Content-Type' header
    // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, same-origin, *omit
    // headers: {
    //   'user-agent': 'Mozilla/4.0 MDN Example',
    //   'content-type': 'application/json'
    // },
    method: m.method,
    mode: 'cors',
    // redirect: 'follow', // manual, *follow, error
    // referrer: 'no-referrer', // *client, no-referrer
  });
}
