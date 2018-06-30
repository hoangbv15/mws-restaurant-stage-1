const MaxRetry = 3;

onmessage = function(e) {
  retryingFetch(e.data, 0);
}

function retryingFetch(req, retry) {
  fetch(req.url, {
    body: JSON.stringify(req.data),
    method: req.method,
    mode: 'cors'
  }).then(res => {
    postMessage({
      result: 'success'
    });
  }, e => {
    // Retry every 5 seconds
    if (retry >= MaxRetry) {
      postMessage({
        result: 'error',
        data: 'Max retry reached',
      });
      return;
    }
    setTimeout(() => { retryingFetch(req, ++retry); }, 5000);
  });
}
