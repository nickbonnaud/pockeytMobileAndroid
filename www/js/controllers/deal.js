(function(angular) {

  var module = angular.module('pockeyt.controllers.deal', []);

  var DealController = function($scope, $stateParams) {
    if(typeof analytics !== "undefined") { analytics.trackView("Deal View"); }
    $scope.deal = $stateParams.deal;

    $scope.checkDevice = function() {
      if(device.platform === "iOS") {
        return 'icon ea-icon-ios-back';
      } else {
        return 'icon ea-icon-android-back';
      }
    };
  };

  module.controller('DealController', ['$scope', '$stateParams', DealController]);
})(angular);