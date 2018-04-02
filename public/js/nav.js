document.addEventListener('DOMContentLoaded', (event) => {
  var button = document.querySelector('.filter-button');
  var filter = document.querySelector('.filter-options');

  button.addEventListener('click', function(e) {
    filter.classList.toggle('open');
    e.stopPropagation();
  });
});
