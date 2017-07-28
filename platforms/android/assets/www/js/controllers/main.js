(function(angular) {

  var module = angular.module('pockeyt.controllers.main', ['pockeyt.services.my-pockeyt', 'pockeyt.services.bookmark', 'pockeyt.services.user-service', 'pockeyt.services.bg-geolocate', 'pockeyt.services.notification', 'pockeyt.services.user-details']);

  var MainController = function($rootScope, $scope, $state, $auth, MyPockeyt, Bookmark, UserService, bgGeolocate, Notification, UserDetails) {

    $scope.$watch(function() { return bgGeolocate.inLocations()}, function(newVal, oldVal) {
      $scope.currentLocations = bgGeolocate.inLocations();
    });

    $scope.$watch(function() { return Notification.getBillWaiting()}, function(newVal, oldVal) {
      console.log(Notification.getBillWaiting());
      $scope.billWaitingApproval = Notification.getBillWaiting();
    });

    $scope.payBill = function() {
      return UserDetails.checkBillOpen().then(function() {
        if (_billOpen) {
          return $state.go('main.menu.bill');
        } else {
          return;
        }
      });
    };

    $scope.myPockeytCheck = function() {
      return MyPockeyt.checkUpdated();
    };

    $scope.updateCheck = function() {
    	MyPockeyt.updateCheck();
    }

    $scope.bookmarkCheck = function() {
      return Bookmark.checkUpdated();
    };

    $scope.updateBookmarkCheck = function() {
    	Bookmark.updateCheck();
    };

    $scope.isBooting = function() {
      return $rootScope.isBooting;
    };

    $scope.isMenu = function() {
      var stateName = $state.$current.name;
      if (stateName.startsWith('main.menu')) {
        return true;
      } else {
        return false;
      }
    };


    $scope.checkIfPartnerState = function() {
      var state = $state.current.name;
      if ((state == 'main.explore.partner') || (state == 'main.my-pockeyt.favorite') || (state == 'main.connect.business') || (state == 'main.profile.edit')) {
        return $scope.isPartner = true;
      } else {
        return $scope.isPartner = false;
      }
    };
  };

  module.controller('MainController', ['$rootScope', '$scope', '$state', '$auth', 'MyPockeyt', 'Bookmark', 'UserService', 'bgGeolocate', 'Notification', 'UserDetails', MainController]);

})(angular);