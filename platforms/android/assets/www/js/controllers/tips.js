(function(angular, moment) {

  var module = angular.module('pockeyt.controllers.tips', ['pockeyt.services.api', 'pockeyt.services.notification']);

  var TipsController = function($scope, $stateParams, $state, api, Notification) {
    if(typeof analytics !== "undefined") { analytics.trackView("Tips View"); }
    $scope.profile = $stateParams.profile;
    $scope.transaction = $stateParams.transaction;
    $scope.transaction.updated_at = moment.utc($scope.transaction.updated_at).local().toDate();
    var bill = angular.fromJson($stateParams.transaction.products);
    $scope.bill = bill;
    $scope.user = $stateParams.user;
    $scope.tip = 0;
    $scope.total = ($scope.transaction.total / 100);
    $scope.clean = true;
    
    $scope.toggleTip = function(button) {
    	$scope.selected = button;

    	switch (button) {
    		case 0:
                $scope.clean = false;
    			var tipRate = 0;
    			break;
    		case 1:
                $scope.clean = false;
    			var tipRate = .1;
    			break;
    		case 2:
                $scope.clean = false;
    			var tipRate = .2;
    			break;
    		case 3:
                $scope.clean = false;
    			var tipRate = "custom";
    			$scope.tip = 0;
    			$scope.total = ($scope.transaction.total / 100);
    			break;
    	}
    	if (tipRate !== "custom") {
    		var total = $scope.transaction.total;
	    	$scope.tip = (total * tipRate) / 100;
	    	$scope.total = (total / 100) + $scope.tip;
	    } 
    };

    $scope.isActive = function(button) {
    	return $scope.selected === button;
    };

    $scope.customInput = function(tip) {
    	var total = $scope.transaction.total;
	    $scope.total = (total + tip * 100) / 100;
    };

    $scope.submitPayment = function() {
        var payload = {
            tipSet: true,
            transactionId: $scope.transaction.id,
            tips: $scope.tip,
            total: $scope.total
        };
        api.request('/transaction/custom', payload, 'PUT')
            .then(function(resp) {
                Notification.setBillWaitingDone();
                window.plugins.toast.showWithOptions({
                    message: "Bill Paid!",
                    duration: "short",
                    position: "top",
                    styling: {
                        backgroundColor: '#20ba12'
                    }
                });
            })
            .catch(function(err) {
                window.plugins.toast.showWithOptions({
                    message: "oops! Something went wrong. Please notify the business",
                    duration: "short",
                    position: "center",
                    styling: {
                        backgroundColor: '#ef0000'
                    }
                });
            });
        $state.go('main.my-pockeyt');
    };
    
  };

  module.controller('TipsController', ['$scope', '$stateParams', '$state', 'PockeytApi', 'Notification', TipsController]);
})(angular, moment);