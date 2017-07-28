(function(angular) {

  var module = angular.module('pockeyt.controllers.deal-details', ['pockeyt.services.api']);

  var DealDetailsController = function($scope, $stateParams, api) {
    if(typeof analytics !== "undefined") { analytics.trackView("Deal Details"); }
    $scope.deal = $stateParams.deal;
    $scope.prevState = $stateParams.prevState;

    $scope.checkDevice = function() {
      if(device.platform === "iOS") {
        return 'icon ea-icon-ios-back';
      } else {
        return 'icon ea-icon-android-back';
      }
    };

    $scope.purchasePost = function(post) {
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
  };

  module.controller('DealDetailsController', ['$scope', '$stateParams', 'PockeytApi', DealDetailsController]);
})(angular);