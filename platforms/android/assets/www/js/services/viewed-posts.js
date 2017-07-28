(function(angular) {

  var module = angular.module('pockeyt.services.viewed-posts', ['pockeyt.services.api', 'LocalStorageModule']);

  module.constant('VIEWED_POSTS_KEY', 'pockeyt.services.viewed-posts.posts');
  module.constant('POSTS_LOADED_EVENT', 'pockeyt.services.viewed-posts.posts-loaded');

  var ViewedPostsFactory = [
    'VIEWED_POSTS_KEY',
    'POSTS_LOADED_EVENT',
    '$rootScope',
    '$q',
    '$timeout',
    'PockeytApi',
    'localStorageService',
    function(POSTS_KEY, POSTS_LOADED_EVENT, $rootScope, $q, $timeout, api, storage) {
    	var _running = false;
    	var _postsViewed = 0;

      var getPosts = function() {
        if(storage.get(POSTS_KEY))
          return $q.resolve(storage.get(POSTS_KEY));
        else {
          return $q(function(resolve, reject) {
            var dereg = $rootScope.$on(POSTS_LOADED_EVENT, function() {
              dereg();
              resolve(storage.get(POSTS_KEY));
            });
          });
        }
      };

      var getStoredPosts = function() {
        return !storage.get(POSTS_KEY) ? [] : storage.get(POSTS_KEY);
      };

      var savePostsToStorage = function(post) {
        return getPosts().then(function(savedPosts) {
          var ids = [];
          angular.forEach(savedPosts, function(savedPost) {
            ids.push(savedPost)
          });

          if (post) {
            ids.push(post);
          };
          storage.set(POSTS_KEY, ids) ? $q.resolve(savedPosts) : $q.reject(new Error('Failed to store posts.'));
        	if (!_running) {
        		_running = true;
        		$timeout(function() {
        			return sendViewedPosts();
        		}, 60000);
        	} else {
        		return 
        	}
        });
      };

      var sendViewedPosts = function() {
      	return getPosts().then(function(newPosts) {
      		if (newPosts.length !== 0) {
	      		return api.request('/analytics/posts/viewed', newPosts, 'POST')
			        .then(function(response) {
			        	return clearStorage(response.data);
			        })
			        .catch(function(err) {
			       		return _running = false;
			        });
	      	} else {
	      		return _running = false;
	      	}
      	});
      };

      var addPost = function(post) {
        return savePostsToStorage(post).then(function() {
          return $q.resolve(post);
        });
      };

      var isStored = function(post) {
        var isStored = false;
        angular.forEach(getStoredPosts(), function(storedPost) {
          if(storedPost == post) {
            isStored = true;
            return false;
          }
        });
        return isStored;
      };

      var postViewed = function(post) {
      	if (!isStored(post)) {
      		return addPost(post);
      	}
      };

      var loadPostsFromStorage = function() {
        var posts = storage.get(POSTS_KEY);
        if(!angular.isArray(posts)) {
          storage.set(POSTS_KEY, []);
          $rootScope.$broadcast(POSTS_LOADED_EVENT);
          return getPosts();
        } else {
          posts = posts.filter(function(post) {return post !== null});
          return savePostsToStorage().then(function(posts) {
            $rootScope.$broadcast(POSTS_LOADED_EVENT);
            return posts;
          });
        }
      };

      var clearStorage = function(savedPosts) {
      	return getPosts().then(function(updatedPosts) {
      		angular.forEach(savedPosts, function(savedPost) {
      			var index = updatedPosts.indexOf(savedPost);
      			if (index > -1) {
      				updatedPosts.splice(index, 1);
      			}
      		});
      		storage.set(POSTS_KEY, updatedPosts);
      		_running = false;
      		if (updatedPosts.length !== 0) {
      			_running = true;
        		$timeout(function() {
        			return sendViewedPosts();
        		}, 60000);
      		} else {
      			return
      		}
      	});
      }

      return {
      	loadPostsFromStorage: loadPostsFromStorage,
        save: savePostsToStorage,
        allPosts: getPosts,
        allStoredPosts: getStoredPosts,
        addPost: addPost,
        isStored: isStored,
        postViewed: postViewed,
        clearStorage: clearStorage,
        sendViewedPosts: sendViewedPosts
      };
    }];
  module.factory('ViewedPosts', ViewedPostsFactory);

  module.run(['ViewedPosts', 'PockeytApi', function(ViewedPosts, api) {
  	ViewedPosts.loadPostsFromStorage();
  	return ViewedPosts.allPosts().then(function(savedPosts) {
	    if (savedPosts.length !== 0) {
	    	return api.request('/analytics/posts/viewed', savedPosts, 'POST')
        .then(function(response) {
        	return ViewedPosts.clearStorage(response.data);
        })
        .catch(function(err) {
       		console.log(err);
        });
	    }
	  });
  }]);

})(angular);