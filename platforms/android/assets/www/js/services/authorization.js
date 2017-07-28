(function(angular) {

  var module = angular.module('pockeyt.services.authorization', ['pockeyt.services.user-service']);

  var AuthorizationFactory = [
    '$rootScope',
    '$state',
    '$location',
    'UserService',
    function($rootScope, $state, $location, UserService) {

      var authorize = function() {
        return UserService.identity()
          .then(function() {
            var isAuthenticated = UserService.isAuthenticated();
            if (!isAuthenticated) {
              if (UserService.hasErrorResponse() === "token_not_provided") {
                var _identity = "signup";
                return _identity;
              } else {
                var _identity = "login";
                return _identity;
              }
            } else {
              return UserService.setUser();
            }
          });
      };
      return {
        authorize: authorize
      };
    }];
  module.factory('Authorization', AuthorizationFactory);
})(angular);
