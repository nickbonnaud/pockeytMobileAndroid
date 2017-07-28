(function(angular) {

  var module = angular.module('pockeyt.services.bookmark', ['pockeyt.repositories.partners', 'pockeyt.models.partner', 'pockeyt.services.interaction-post', 'LocalStorageModule']);

  module.constant('BOOKMARK_POSTS_KEY', 'pockeyt.services.bookmark.posts');
  module.constant('POSTS_LOADED_EVENT', 'pockeyt.services.bookmark.posts-loaded');

  var BookmarkFactory = [
    'BOOKMARK_POSTS_KEY',
    'POSTS_LOADED_EVENT',
    'partnersRepository',
    'Partner',
    '$rootScope',
    '$q',
    'InteractionPost',
    'localStorageService',
    function(POSTS_KEY, POSTS_LOADED_EVENT, partnersRepository, Partner, $rootScope, $q, InteractionPost, storage) {

      var _cache = {
        posts: false
      };

      var _updated = false;

      var getCache = function() {
        return $q.resolve(_cache);
      };

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

      var getCachedPosts = function() {
        return !_cache.posts ? [] : _cache.posts;
      };

      var getStoredPosts = function() {
        return !storage.get(POSTS_KEY) ? [] : storage.get(POSTS_KEY);
      };

      var loadPostsFromStorage = function() {
        var posts = storage.get(POSTS_KEY);
        if(!angular.isArray(posts)) {
          storage.set(POSTS_KEY, []);
          _cache.posts = [];
          $rootScope.$broadcast(POSTS_LOADED_EVENT);
          return getPosts();
        } else {
          var promises = [];
          angular.forEach(posts, function(id) {
            promises.push(partnersRepository.find(id, false));
          });
          return $q.all(promises).then(function(posts) {
            if(!angular.isArray(_cache.posts))
              _cache.posts = [];
            posts = posts.filter(function(post) {return post !== null});
            Array.prototype.push.apply(_cache.posts, posts);
            return savePostsToStorage().then(function(posts) {
              $rootScope.$broadcast(POSTS_LOADED_EVENT);
              return posts;
            });
          });
        }
      };

      var fixPosts = function() {
        var promises = [];
        angular.forEach(_cache.posts, function(post, index) {
          promises.push(partnersRepository.find(post.id, false).then(
              function(partner) {
                return $q.resolve({index: index, post: post, partner: partner == null ? false : partner});
              }
          ));
        });
        return $q.all(promises).then(function(data) {
          var removeIndices = [];
          angular.forEach(data, function(comp) {
            if(!comp.partner)
              removeIndices.push(comp.index);
            else
              _cache.favorites[comp.index] = comp.partner;
          });
          if(removeIndices.length > 0) {
            removeIndices.sort(function(a, b) {
              return b - a;
            });
            angular.forEach(removeIndices, function(k) {
              _cache.favorites.splice(k, 1);
            });
          }
        });
      };

      var savePostsToStorage = function(partner) {
        return getPosts().then(function(posts) {
          var ids = [];
          angular.forEach(posts, function(post) {
            ids.push(post)
          });

          if (partner) {
            ids.push(partner.id);
            var type = 'bookmark';
            var action = 'add';
            InteractionPost.buttonInteraction(type, partner, action);
          };
          return storage.set(POSTS_KEY, ids) ? $q.resolve(posts) : $q.reject(new Error('Failed to store posts.'));
        });
      };

      var addPost = function(partner) {
        var promise = ((angular.isString(partner) || angular.isNumber(partner)) ?
                partnersRepository.find(partner) :
                $q.resolve(partner)
        );

        return promise
            .then(function(partner) {
              if(isBookmark(partner)) {
                return $q.resolve(partner);
              } else {
                return savePostsToStorage(partner).then(function() {
                  return $q.resolve(partner);
                });
              }
            });
      };

      var removePost = function(partner) {
        var promise = ((angular.isString(partner) || angular.isNumber(partner)) ?
                partnersRepository.find(partner) :
                $q.resolve(partner)
        );

        return promise
            .then(function(partner) {
              var removed = false;
              var ids = [];

              angular.forEach(getStoredPosts(), function(post, index) {
                ids.push(post);
                if(!removed && post === partner.id) {
                  ids.splice(index, 1);
                  removed = true;
                }
                return !removed;
              });

              if(removed) {
                var type = 'bookmark';
                var action = 'remove';
                InteractionPost.buttonInteraction(type, partner, action);
                return storage.set(POSTS_KEY, ids) ? $q.resolve(partner) : $q.reject(new Error('Failed to remove post'));
              } else {
                return $q.resolve(partner);
              }
            });
      };

      var isBookmark = function(partner) {
        var isBookmark = false;
        angular.forEach(getStoredPosts(), function(post) {
          if(post == partner.id) {
            isBookmark = true;
            return false;
          }
        });
        return isBookmark;
      };

      var toggleBookmark = function(partner) {
        _updated = true;
        return isBookmark(partner) ? removePost(partner) : addPost(partner);
      };

      var checkUpdated = function() {
        return _updated;
      };

      var updateCheck = function() {
        _updated = false;
      };

      $rootScope.$watch(function() {
        return partnersRepository.allCached();
      }, function(val) {
        fixPosts(val);
      }, true);

      return {
        reload: loadPostsFromStorage,
        save: savePostsToStorage,
        allCached: getCache,
        allPosts: getPosts,
        allCachedPosts: getCachedPosts,
        allStoredPosts: getStoredPosts,
        addPost: addPost,
        removePost: removePost,
        isBookmark: isBookmark,
        toggleBookmark: toggleBookmark,
        checkUpdated: checkUpdated,
        updateCheck: updateCheck
      };

    }];

  module.factory('Bookmark', BookmarkFactory);

  module.run(['Bookmark', function(Bookmark) {
    Bookmark.reload();
  }]);

})(angular);