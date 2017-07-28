(function(angular) {

  var module = angular.module('pockeyt.controllers.explore', ['pockeyt.repositories.partners', 'pockeyt.services.my-pockeyt', 'pockeyt.services.bookmark', 'pockeyt.services.authorization', 'pockeyt.services.api', 'pockeyt.services.viewed-posts', 'pockeyt.services.interaction-post']);

  var ExploreController = function($rootScope, $scope, $state, allPartners, repository, MyPockeyt, Bookmark, Authorization, api, ViewedPosts, InteractionPost) {
    if(typeof analytics !== "undefined") { analytics.trackView("Explore View"); }
    this.partners = {};
    this.update(allPartners);

    $scope.$watch(function() {return repository.allCached();}, function(val) {
      this.update(val);
    }.bind(this), true);

    angular.element(document).ready(function() {
      $rootScope.viewLoaded = true;
    });

    $scope.loadMore= function() {
      repository.loadMore();
    };

    $scope.isLoading = function() {
      return repository.isLoading;
    };

    $scope.parentShareContent = function(top) {
      if(typeof analytics !== "undefined") { analytics.trackEvent("Share Button", "Explore", top.message); }
      return this.window.plugins.socialsharing.shareViaSMS('I found this on Pockeyt http://pockeytbiz.com/posts/' + top.id, null,
        function(msg) {
          if (msg) {
            var type = 'share';
            return InteractionPost.buttonInteraction(type, top);
          }
        }, 
        function(msg) {
          console.log(msg);
        }
      );
    };

    $scope.postViewed = function(post, inview, inviewInfo) {
      if (inview && inviewInfo.parts.bottom) {
        if (!inviewInfo.parts.top) {
          return ViewedPosts.postViewed(post.id);
        }
      }
    };

    $scope.parentPurchasePost = function(post) {
      Authorization.authorize().then(function(user) {
        $scope.user = user;

        console.log($scope.user);
        if ($scope.user === 'signup' || $scope.user === 'login') {
          return navigator.notification.confirm(
            'Please login to make purchase',
            function(buttonIndex) {
              getUserSelectionAuth(buttonIndex, $scope.user);
            },
            'Login Required',
            ['Login', 'Cancel']
          );
        } else {
          $scope.post = post;
          return navigator.notification.confirm(
            'Purchase this post to receive a ' + post.deal_item + ' on your next visit to ' + post.business_name + '.',
            function(buttonIndex) {
              getUserSelectionPurchase(buttonIndex, $scope.post);
            },
            'Purchase now',
            ['Purchase', 'See Deal Info', 'Cancel']
          );
        }
      });
    };

    var getUserSelectionPurchase = function(buttonIndex, post) {
      switch(buttonIndex) {
        case 1:
          purchasePost(post);
          break;
        case 2:
          getDealInfo(post);
          break;
        case 3:
          return;
          break;
      }
    };

    var purchasePost = function(post) {
      api.request('/transaction/deal', post, 'POST')
        .then(function(response) {
          window.plugins.toast.showWithOptions({
              message: "Post Purchased! Redeem at your next visit!",
              duration: "long",
              position: "center",
              styling: {
                  backgroundColor: '#20ba12',
                  textSize: '20px'
              }
          });
        })
        .catch(function(err) {
          return window.plugins.toast.showWithOptions({
            message: "Oops! Error an error occured please contact Pockeyt.",
            duration: "long",
            position: "center",
            styling: {
              backgroundColor: '#ef0000'
            }
          });
        });
    };

    var getDealInfo = function(post) {
      var prevState = 'explore';
      return $state.go('main.deal-details', {deal: post, prevState: prevState});
    };

    var getUserSelectionAuth = function(buttonIndex, user) {
      if (user === 'signup') {
        switch(buttonIndex) {
          case 1:
            return $state.go('main.menu.signup');
            break;
          case 2:
            return;
            break;
        }
      } else if (user === 'login') {
        switch(buttonIndex) {
          case 1:
            return $state.go('main.menu.login');
            break;
          case 2:
            break;
        }
      }
    };

    $scope.parentOpenMenu = function(post) {
      $scope.post = post;
      var isBookmark = Bookmark.isBookmark(post);
      var isFavorite =  MyPockeyt.isFavorite(post);
      if (isFavorite && isBookmark) {
        var options = {
          androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
          buttonLabels: ['Remove from Bookmarks', 'Remove from My Pockeyt'],
          androidEnableCancelButton : true,
          addCancelButtonWithLabel: 'Cancel'
        };
      } else if (!isFavorite && isBookmark) {
        var options = {
          androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
          buttonLabels: ['Remove from Bookmarks', 'Add to My Pockeyt'],
          androidEnableCancelButton : true,
          addCancelButtonWithLabel: 'Cancel'
        };
      } else if (isFavorite && !isBookmark) {
        var options = {
          androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
          buttonLabels: ['Add to Bookmarks', 'Remove from My Pockeyt'],
          androidEnableCancelButton : true,
          addCancelButtonWithLabel: 'Cancel'
        };
      } else if (!isFavorite && !isBookmark) {
        var options = {
          androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
          buttonLabels: ['Add to Bookmarks', 'Add to My Pockeyt'],
          androidEnableCancelButton : true,
          addCancelButtonWithLabel: 'Cancel'
        };
      }
      window.plugins.actionsheet.show(options, menuCallBack);
    };

    var menuCallBack = function(buttonIndex) {
      if (buttonIndex === 1) {
        Bookmark.toggleBookmark($scope.post);
      } else if (buttonIndex === 2) {
        MyPockeyt.toggleFavorite($scope.post);
      }
    };
  };

  ExploreController.prototype.update = function(partners) {
    this.partners.all = partners;
  };

  module.controller('ExploreController', ['$rootScope', '$scope', '$state', 'allPartners', 'partnersRepository', 'MyPockeyt', 'Bookmark', 'Authorization', 'PockeytApi', 'ViewedPosts', 'InteractionPost', ExploreController]);

})(angular);