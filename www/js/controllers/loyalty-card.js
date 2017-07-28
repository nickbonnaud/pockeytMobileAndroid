(function(angular) {

  var module = angular.module('pockeyt.controllers.loyalty-card', []);

  var LoyaltyCardController = function($scope, $stateParams) {
    if(typeof analytics !== "undefined") { analytics.trackView("Loyalty Card View"); }
    $scope.loyaltyCard = $stateParams.loyaltyCard;
    $scope.labels = ["Purchases", "Purchases Left"];
    $scope.currentAmount = $scope.loyaltyCard.current_amount;
    $scope.purchasesRequired = $scope.loyaltyCard.purchases_required - $scope.currentAmount;
    $scope.amountRequired = $scope.loyaltyCard.amount_required - $scope.currentAmount;

    $scope.dataIncrement = [$scope.currentAmount, $scope.purchasesRequired];
    $scope.dataAmount = [$scope.currentAmount, $scope.amountRequired];
    $scope.options = {cutoutPercentage: 75};

    $scope.checkDevice = function() {
      if(device.platform === "iOS") {
        return 'icon ea-icon-ios-back';
      } else {
        return 'icon ea-icon-android-back';
      }
    };

  };

  module.controller('LoyaltyCardController', ['$scope', '$stateParams', LoyaltyCardController]);
})(angular);