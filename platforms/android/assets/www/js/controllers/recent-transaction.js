(function(angular) {

  var module = angular.module('pockeyt.controllers.recent-transaction', []);

  var RecentTransactionController = function($scope, $stateParams) {
    if(typeof analytics !== "undefined") { analytics.trackView("Recent Transaction View"); }
    $scope.transaction = $stateParams.transaction;
    $scope.bill = angular.fromJson($scope.transaction.products);

    $scope.checkDevice = function() {
      if(device.platform === "iOS") {
        return 'icon ea-icon-ios-back';
      } else {
        return 'icon ea-icon-android-back';
      }
    };
  };

  module.controller('RecentTransactionController', ['$scope', '$stateParams', RecentTransactionController]);
})(angular);