(function(angular) {

  var module = angular.module('pockeyt.controllers.partner', ['ui.router', 'ngSanitize', 'pockeyt.repositories.business-posts', 'pockeyt.services.my-pockeyt', 'pockeyt.services.bookmark', 'pockeyt.services.authorization', 'pockeyt.services.api', 'pockeyt.services.interaction-post']);

  /**
   *
   * @param {Partner} partner
   * @param {MyPockeyt} MyPockeyt
   * @param {$state} $state
   * @constructor
   *
   * @property {Partner} entity
   * @property {string} info
   * @property {{date: Date|bool,body:string}[]} feed
   */
  var PartnerController = function($state, $scope, repository, MyPockeyt, Bookmark, Authorization, api, InteractionPost, partner, allPosts) {
    if(typeof analytics !== "undefined") { analytics.trackView("Individual Partner View"); }
    if(partner === null) {alert('Could not find partner.'); $state.go('my-pockeyt');}
    else {
      this.entity = partner;
      this.posts = allPosts;
      $scope.hasMore = function() {
        return repository.hasMore;
      } 

      this.toggleFavorite = function() {
        return MyPockeyt.toggleFavorite(this.entity);
      };
      this.goUrl = function(partner) {
        window.open($scope.partner.entity.url, '_system', 'location=yes');
      };
      this.goReview = function(partner) {
        window.open($scope.partner.entity.review_url, '_system', 'location=yes');
      };
      this.favorite = MyPockeyt.isFavorite(this.entity);
      $scope.$watch(function() {return MyPockeyt.isFavorite(this.entity);}.bind(this), function(val) {
        this.favorite = val;
      }.bind(this), true);

      $scope.parentShareContent = function(post) {
        if(typeof analytics !== "undefined") { analytics.trackEvent("Share Button", "My Pockeyt", post.message); }
        this.window.plugins.socialsharing.shareViaSMS('I found this on Pockeyt http://pockeytbiz.com/posts/' + post.id, null,
          function(msg) {
            if (msg) {
              var type = 'share';
              InteractionPost.buttonInteraction(type, post);
            }
          }, 
          function(msg) {
            console.log(msg);
          }
        );
      };

      $scope.checkDevice = function() {
        if(device.platform === "iOS") {
          return 'icon ea-icon-ios-back';
        } else {
          return 'icon ea-icon-android-back';
        }
      };

      $scope.loadMorePosts = function(partner) {
        repository.loadMore(partner);
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
        if (isBookmark) {
          var options = {
            androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
            buttonLabels: ['Remove from Bookmarks'],
            androidEnableCancelButton : true,
            addCancelButtonWithLabel: 'Cancel'
          };
        } else if (!isBookmark) {
          var options = {
            androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT,
            buttonLabels: ['Add to Bookmarks'],
            androidEnableCancelButton : true,
            addCancelButtonWithLabel: 'Cancel'
          };
        } 
        window.plugins.actionsheet.show(options, menuCallBack);
      };

      var menuCallBack = function(buttonIndex) {
        if (buttonIndex === 1) {
          Bookmark.toggleBookmark($scope.post);
        } 
      };
    }

  };

  module.controller('PartnerController', ['$state', '$scope', 'businessPostsRepository', 'MyPockeyt', 'Bookmark', 'Authorization', 'PockeytApi', 'InteractionPost', 'partner', 'allPosts', PartnerController]);

})(angular);