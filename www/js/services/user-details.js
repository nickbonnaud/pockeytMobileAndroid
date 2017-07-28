(function(angular) {

  var module = angular.module('pockeyt.services.user-details', ['pockeyt.services.api']);

  var UserDetailsFactory = [
    '$q',
    '$auth',
    'PockeytApi',
    function($q, $auth, api) {

      var _transaction = undefined,
          _user = undefined,
          _profile = undefined,
          _token = undefined;
          _currentBill = undefined;
          _apiResponse = undefined;
          _billOpen = false;
          _recentTransactions = undefined;

      var isBillResolved = function() {
        return angular.isDefined(_transaction);
      };

      var isUserResolved = function() {
      	return angular.isDefined(_user);
      }

      var isProfileResolved = function() {
      	return angular.isDefined(_profile);
      }

      var hasErrorResponse = function() {
        return _apiResponse;
      };

      var getBill = function() {
        return bill()
          .then(function() {
            return _currentBill;
          });
      };

      var checkBillOpen = function() {
        return hasBillOpen()
          .then(function() {
            return _billOpen;
          });
      };

      var bill = function() {
        var deferred = $q.defer();
        _token = {Authorization: 'Bearer ' + $auth.getToken()};
        api.request('/transaction/show', null, 'GET', _token)
          .then(function(response) {
            _user = response.data.customer;
            _transaction = response.data.transaction;
            _profile = response.data.profile;
            _currentBill = {'user': _user, 'transaction': _transaction, 'profile': _profile};
            deferred.resolve(_currentBill);
          })
          .catch(function(response) {
            _user = undefined;
            _transaction = undefined;
            _profile = undefined;
            _currentBill = undefined;
            _apiResponse = response.data.error;
            deferred.resolve(_currentBill);
          });
        return deferred.promise;
      };

      var hasBillOpen = function() {
        var deferred = $q.defer();
        _token = {Authorization: 'Bearer ' + $auth.getToken()};
        api.request('/transaction/open', null, 'GET', _token)
          .then(function(response) {
            _billOpen = response.data;
            deferred.resolve(_billOpen);
          })
          .catch(function(response) {
            _billOpen = response.data;
            deferred.resolve(_billOpen);
          });
        return deferred.promise;
      };

      return {
        isBillResolved: isBillResolved,
        isUserResolved: isUserResolved,
        isProfileResolved: isProfileResolved,
        hasErrorResponse: hasErrorResponse,
        getBill: getBill,
        bill: bill,
        hasBillOpen: hasBillOpen,
        checkBillOpen: checkBillOpen,
      };
    }];
  module.factory('UserDetails', UserDetailsFactory);
})(angular);
