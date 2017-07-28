(function(angular) {

  var module = angular.module('pockeyt.controllers.bookmark', ['pockeyt.repositories.bookmarks', 'pockeyt.services.bookmark', 'pockeyt.services.authorization', 'pockeyt.services.api', 'pockeyt.services.my-pockeyt', 'pockeyt.services.interaction-post']);

  var BookmarkController = function($scope, allPartners, repository, $state, Bookmark, Authorization, api, MyPockeyt, InteractionPost) {

    if(typeof analytics !== "undefined") { analytics.trackView("Bookmark View"); }
    this.partners = {};
    this.update(allPartners);
    $scope.empty = function() {
      return repository.empty;
    };

    $scope.hasMore = function() {
      return repository.hasMore;
    };

    $scope.checkDevice = function() {
      if(device.platform === "iOS") {
        return 'icon ea-icon-ios-back';
      } else {
        return 'icon ea-icon-android-back';
      }
    };

    $scope.parentShareContent = function(top) {
      if(typeof analytics !== "undefined") { analytics.trackEvent("Share Button", "Bookmark", top.message); }
      this.window.plugins.socialsharing.shareViaSMS('I found this on Pockeyt http://pockeytbiz.com/posts/' + top.id, null,
        function(msg) {
          if (msg) {
            var type = 'share';
            InteractionPost.buttonInteraction(type, top);
          }
        }, 
        function(msg) {
          console.log(msg);
        }
      );
    };

    $scope.$watch(function() {return repository.allCached();}, function(val) {
      this.update(val);
    }.bind(this), true);

    $scope.loadMore = function() {
      repository.loadMoreBookmarks();
    };

    $scope.isLoading = function() {
      return repository.isLoading;
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
      var prevState = 'my-pockeyt';
      return $state.go('main.deal-details', {deal: post, prevState: prevState});
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
  
  BookmarkController.prototype.update = function(partners) {
    this.partners.all = partners;
  };

  module.controller('BookmarkController', ['$scope', 'allPartners', 'bookmarksRepository', '$state', 'Bookmark', 'Authorization', 'PockeytApi', 'MyPockeyt', 'InteractionPost', BookmarkController]);

})(angular);