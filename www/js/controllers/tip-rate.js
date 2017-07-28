(function(angular) {

  var module = angular.module('pockeyt.controllers.tip-rate', ['pockeyt.services.api', 'pockeyt.services.user-service', 'pockeyt.services.bg-geolocate']);

  var TipRateController = function($scope, $state, api, UserService, bgGeolocate, user) {
    if(typeof analytics !== "undefined") { analytics.trackView("Tip Rate View"); }
    $scope.clean = true;

    $scope.checkDevice = function() {
      if(device.platform === "iOS") {
        return 'icon ea-icon-ios-back';
      } else {
        return 'icon ea-icon-android-back';
      }
    };

    $scope.toggleTip = function(button) {
    	$scope.selected = button;

    	switch (button) {
    		case 0:
          $scope.clean = false;
    			$scope.tipRate = .10;
    			break;
    		case 1:
          $scope.clean = false;
    			$scope.tipRate = .15;
    			break;
    		case 2:
          $scope.clean = false;
    			$scope.tipRate = .20;
    			break;
    		case 3:
          $scope.clean = false;
          $scope.tipRate = '';
    			break;
    	}
    };

    $scope.isActive = function(button) {
    	return $scope.selected === button;
    };

    $scope.customActive = function() {
    	return $scope.selected === 3;
    }

    $scope.submitDefaultTip = function() {
      var payload = {
        default_tip_rate: $scope.tipRate
      };
      api.request('/set/tip', payload, 'POST')
        .then(function(resp) {
          var user = resp.data.user;
        	UserService.updateUser(user);
          if (!user.edit) { bgGeolocate.initGeo(); }
          return $state.go('main.menu.profile', null, {reload: true});
        })
        .catch(function(err) {
      		console.log(err);
        });
    };
  };

  module.controller('TipRateController', ['$scope', '$state', 'PockeytApi', 'UserService', 'bgGeolocate', 'user', TipRateController]);
})(angular);