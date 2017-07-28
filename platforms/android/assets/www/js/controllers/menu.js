(function(angular) {

  var module = angular.module('pockeyt.controllers.menu', ['pockeyt.services.user-service', 'pockeyt.services.api']);

  var MenuController = function($scope, $auth, $state, UserService, user, billOpen, api) {
    if(typeof analytics !== "undefined") { analytics.trackView("Menu View"); }
    $scope.user = user;
    $scope.billOpen = billOpen;

    $scope.emailUs = function() {
	    window.plugins.socialsharing.shareViaEmail(
	      '',
	      'Contact Pockeyt',
	      ['contact@pockeyt.com'],
	      null,
	      null,
	      null,
	      function(msg) { console.log('ok')},
	      function(err) {
	      	window.plugins.toast.showWithOptions({
              message: "oops! Something went wrong: " + err,
              duration: "short",
              position: "center",
              styling: {
                  backgroundColor: '#ef0000'
              }
          });
	      }
	    );
	  };

    $scope.sendInvite = function() {
      var payload = {
        userId: $scope.user.id
      };
      api.request('/invites/user/new', payload, 'POST')
        .then(function(resp) {
          this.window.plugins.socialsharing.shareViaSMS('Invite Code to use Pockeyt Payments: ' + resp.data + '. Pockeyt Download Link: https://bnc.lt/igem/jA669729tC', null,
            function(msg) {
              if (msg) {
                console.log(msg);
              }
            }, 
            function(msg) {
              console.log(msg);
            }
          );
        })
        .catch(function(err) {
          window.plugins.toast.showWithOptions({
              message: "oops! Something went wrong. Please try again later",
              duration: "long",
              position: "center",
              styling: {
                  backgroundColor: '#ef0000'
              }
          });
        });
    }

    $scope.signOut = function() {
      $auth.logout();
      UserService.signOut();
      $state.go('main.my-pockeyt');
    };
  };


  module.controller('MenuController', ['$scope', '$auth', '$state', 'UserService', 'user', 'billOpen', 'PockeytApi', MenuController]);
})(angular);