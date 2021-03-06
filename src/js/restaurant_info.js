import DBHelper from './dbhelper';

let restaurant;
var map;
let _initMapResolve;
let _initMapPromise = new Promise(resolve => { _initMapResolve = resolve; });

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  document.forms['reviewForm'].onsubmit = () => {
    return submitReview();
  };
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      fillBreadcrumb();
      _initMapPromise.then(() => {
        self.map.setCenter(restaurant.latlng);
        DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      });
    }
  });
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    scrollwheel: false
  });
  _initMapResolve();
}

function submitReview() {
  var form = document.forms['reviewForm'];
  var name = form['name'].value;
  var rating = form['rating'].value;
  var comment = form['comment'].value;

  var review = {
    name: name,
    updatedAt: new Date().getTime(),
    rating: rating,
    comments: comment,
    state: 'pending'
  };

  DBHelper.postReview(self.restaurant.id, name, rating, comment).then(() => {
    review.state = 'success';
    fillReviewsHTML();
  }, err => {
    review.state = 'failed';
    fillReviewsHTML();
  });

  if (!Array.isArray(self.restaurant.reviews) || !self.restaurant.reviews.length) {
    self.restaurant.reviews = [review];
  } else {
    self.restaurant.reviews.push(review);
  }

  fillReviewsHTML();

  return false;
}

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL(callback){
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    let error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    let resId = parseInt(id);
    DBHelper.fetchRestaurantById(resId, (error, restaurant) => {
      if (!restaurant) {
        console.error(error);
        return;
      }
      self.restaurant = restaurant;
      if (self.reviews) {
        self.restaurant.reviews = self.reviews;
      }

      fillRestaurantHTML();
      callback(null, restaurant)
    });

    DBHelper.fetchReviews(resId, (error, reviews) => {
      if (!reviews) {
        console.error(error);
        return;
      }
      if (!Array.isArray(reviews)) {
        reviews = [reviews];
      }

      if (self.restaurant) {
        self.restaurant.reviews = reviews;
      } else {
        self.reviews = reviews;
      }
      fillReviewsHTML();
    });
  }
}

function handleFavourite(e, id) {
  DBHelper.addToFavourite(id, e.target.checked);
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant = self.restaurant){
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const favourite = document.getElementById('restaurant-favourite');
  favourite.onchange = e => handleFavourite(e, restaurant.id);
  if (restaurant.is_favorite === true || restaurant.is_favorite === 'true') {
    favourite.setAttribute('checked', true);
  }

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = `Image for ${restaurant.name}`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML(operatingHours = self.restaurant.operating_hours){
  const hours = document.getElementById('restaurant-hours');
  hours.innerHTML = null;
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.restaurant.reviews) {
  const container = document.getElementById('reviews-container');
  container.innerHTML = null;
  const header = document.createElement('h2');
  header.innerHTML = 'Reviews';
  container.appendChild(header);
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.createElement('reviews-list');
  ul.className = 'reviews-list';
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {
  const li = document.createElement('li');

  if (review.state === 'pending') {
    li.classList.add('review-item-pending');
    const spinner = document.createElement('p');
    spinner.classList.add('review-item-spinner');
    spinner.innerHTML = 'Status pending';
    spinner.setAttribute('tabindex', '0');
    li.appendChild(spinner);
  } else if (review.state === 'failed'){
    li.classList.add('review-item-failed');
    const failIcon = document.createElement('p');
    failIcon.classList.add('review-item-failed-icon');
    failIcon.innerHTML = '⚠';
    failIcon.setAttribute('tabindex', '0');
    li.appendChild(failIcon);
  } else {
    li.classList.add('review-item');
  }

  const name = document.createElement('p');
  name.classList.add('review-name');
  name.innerHTML = review.name;
  name.setAttribute('tabindex', '0');
  li.appendChild(name);

  const date = document.createElement('p');
  date.classList.add('review-date');
  date.innerHTML = new Date(review.updatedAt).toDateString();
  date.setAttribute('tabindex', '0');
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.classList.add('review-rating');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('tabindex', '0');
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.classList.add('review-comments');
  comments.innerHTML = review.comments;
  comments.setAttribute('tabindex', '0');
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb (restaurant=self.restaurant) {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
