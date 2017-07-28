(function(angular) {

  var module = angular.module('pockeyt.controllers.recent-transactions', ['pockeyt.repositories.transactions']);

  var RecentTransactionsController = function($scope, $state, repository, recentTransactions) {
    if(typeof analytics !== "undefined") { analytics.trackView("Recent Transactions View"); }
    $scope.transactions = recentTransactions;
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

  module.controller('RecentTransactionsController', ['$scope', '$state', 'transactionsRepository', 'recentTransactions', RecentTransactionsController]);
})(angular);