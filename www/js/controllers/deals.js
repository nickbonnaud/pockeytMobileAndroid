(function(angular) {

  var module = angular.module('pockeyt.controllers.deals', ['pockeyt.repositories.deals']);

  var DealsController = function($scope, $state, repository, allDeals) {
    if(typeof analytics !== "undefined") { analytics.trackView("Deals View"); }
    $scope.deals = allDeals;
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

    $scope.loadMore= function() {
      repository.loadMore();
    };

    $scope.isLoading = function() {
      return repository.isLoading;
    };
  };

  module.controller('DealsController', ['$scope', '$state', 'dealsRepository', 'allDeals', DealsController]);
})(angular);