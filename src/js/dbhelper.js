import idb from 'idb';

const ResStoreName = 'restaurants';
const ReviewStoreName = 'reviews';
const openResDb = idb.open('udacity-restaurant-store', 1, db => {
  db.createObjectStore(ResStoreName, {keyPath: 'id'});
  db.createObjectStore(ReviewStoreName, {keyPath: 'id'});
});

const PORT = 1337;
const BACKEND_URL = `http://localhost:${PORT}`;
const RESTAURANT_URL = `${BACKEND_URL}/restaurants`;
const REVIEW_URL = `${BACKEND_URL}/reviews`

let _worker;

document.addEventListener('DOMContentLoaded', (event) => {
  createWebWorker();
});

function createWebWorker() {
  if (!window.Worker) {
    return;
  }

  _worker = new Worker('/worker.js');
}

/**
 * Common database helper functions.
 */
export default class DBHelper {
  /**
   * Chain the fetch promise with proper callback handling
   */
  static finaliseFetch(promise, callback) {
    promise.then(res => res.json())
      .then(res => {
        if (res) {
          openResDb.then(db => {
            const tx = db.transaction(ResStoreName, 'readwrite');
            const store = tx.objectStore(ResStoreName);
            if (res.forEach) {
              res.forEach(r => {
                if (r && r.id) {
                  store.put(r);
                }
              });
            } else if (res && res.id) {
              store.put(res);
            }
          });
        }
        callback(null, res);
      })
      .catch(err => callback(err, null));
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    const refresh = () => DBHelper.finaliseFetch(fetch(RESTAURANT_URL), callback);
    openResDb.then(db => {
      db.transaction(ResStoreName)
        .objectStore(ResStoreName)
        .getAll()
        .then(res => {
          if (res) {
            callback(null, res);
          }
          refresh();
        })
        .catch(refresh);
    }).catch(refresh);
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    const refresh = () => DBHelper.finaliseFetch(
      fetch(RESTAURANT_URL + `/${id}`), callback);
    openResDb.then(db => {
      db.transaction(ResStoreName)
        .objectStore(ResStoreName)
        .get(id)
        .then(res => {
          if (res) {
            callback(null, res);
          }
          refresh();
        })
        .catch(refresh);
    }).catch(refresh);
  }

  static finaliseReviewFetch(promise, callback) {
    promise.then(res => res.json())
      .then(res => {
        if (res) {
          openResDb.then(db => {
            const tx = db.transaction(ReviewStoreName, 'readwrite');
            const store = tx.objectStore(ReviewStoreName);
            if (res && res.length) {
              let data = {
                id: res[0].restaurant_id,
                reviews: res
              };
              store.put(data);
            }
          });
        }
        callback(null, res);
      })
      .catch(err => callback(err, null));
  }

  static fetchReviews(id, callback) {
    const refresh = () => DBHelper.finaliseReviewFetch(
      fetch(REVIEW_URL + `/?restaurant_id=${id}`), callback);
    openResDb.then(db => {
      db.transaction(ReviewStoreName)
        .objectStore(ReviewStoreName)
        .get(id)
        .then(res => {
          if (res && res.reviews) {
            callback(null, res.reviews);
          }
          refresh();
        })
        .catch(refresh);
    }).catch(refresh);
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {;
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph ? `/img/${restaurant.photograph}-400px.jpg` : '';
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  /**
   * Post a restaurant review
   */
  static postReview(id, name, rating, comment) {
    var data = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comment
    };

    if (_worker) {
      return new Promise((resolve, reject) => {
        _worker.addEventListener('message', e => {
          let msg = e.data;
          if (msg.result === 'success') {
            resolve(msg.data);
          } else if (msg.result === 'error') {
            reject(msg.message);
          }
        });

        _worker.postMessage({
          action: 'postReview',
          url: REVIEW_URL,
          data: data,
          method: 'POST'
        });

      });
    }

    return fetch(REVIEW_URL, {
      body: JSON.stringify(data), // must match 'Content-Type' header
      // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, same-origin, *omit
      // headers: {
      //   'user-agent': 'Mozilla/4.0 MDN Example',
      //   'content-type': 'application/json'
      // },
      method: 'POST',
      mode: 'cors',
      // redirect: 'follow', // manual, *follow, error
      // referrer: 'no-referrer', // *client, no-referrer
    });
  }
}
