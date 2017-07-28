(function(angular) {

  var module = angular.module('pockeyt.services.user-service', ['pockeyt.services.api']);

  var UserServiceFactory = [
    '$q',
    '$auth',
    'PockeytApi',
    function($q, $auth, api) {

      var _identity = undefined,
          _apiResponse = undefined,
          _token = undefined,
          _authenticated = false;

      var isIdentityResolved = function() {
        return angular.isDefined(_identity);
      };

      var isAuthenticated = function() {
        return _authenticated;
      };

      var hasErrorResponse = function() {
        return _apiResponse;
      };

      var authenticate = function(identity) {
        _identity = identity
        _authenticated = identity != null;
      };

      var signOut = function() {
        _identity = undefined;
        _authenticated =false;
        _apiResponse = undefined;
        _token = undefined;
      }

      var identity = function() {
        var deferred = $q.defer();
        if (angular.isDefined(_identity)) {
          deferred.resolve(_identity);
          return deferred.promise;
        }
        _token = {Authorization: 'Bearer ' + $auth.getToken()};
        api.request('/authenticate/user', null, 'GET', _token)
          .then(function(response) {
            _identity = response.data.user;
            _authenticated = true;
            deferred.resolve(_identity);
          })
          .catch(function(response) {
            _identity = undefined;
            _authenticated = false;
            _apiResponse = response.data.error;
            deferred.resolve(_identity);
          });
        return deferred.promise;
      };

      var setUser = function() {
        return _identity;
      };

      var updateUser = function(user) {
        return _identity = user;
      }

      var refreshToken = function() {
        api.request('/token/refresh', null, 'POST')
        .then(function(response) {
          $auth.setToken(response.data);
        })
        .catch(function(err) {
          console.log(err);
        });
      };

      var clearIdentity = function() {
        _identity = undefined;
      }

      return {
        isIdentityResolved: isIdentityResolved,
        isAuthenticated: isAuthenticated,
        hasErrorResponse: hasErrorResponse,
        authenticate: authenticate,
        identity: identity,
        signOut: signOut,
        setUser: setUser,
        updateUser: updateUser,
        refreshToken: refreshToken,
        clearIdentity: clearIdentity
      };
    }];
  module.factory('UserService', UserServiceFactory);
})(angular);
