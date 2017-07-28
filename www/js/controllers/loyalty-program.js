(function(angular) {

  var module = angular.module('pockeyt.controllers.loyalty-program', ['pockeyt.repositories.loyalty-cards']);

  var LoyaltyProgramController = function($scope, $state, repository, loyaltyCards) {
    if(typeof analytics !== "undefined") { analytics.trackView("Loyalty Program View"); }
    $scope.loyaltyCards = loyaltyCards;
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

  module.controller('LoyaltyProgramController', ['$scope', '$state', 'loyaltyCardsRepository', 'loyaltyCards', LoyaltyProgramController]);
})(angular);