(function(angular) {

  var module = angular.module('pockeyt.services.notify-service', []);

  var NotifyServiceFactory = [
    '$rootScope',
    function($rootScope) {

      var subscribe = function(scope, callback) {
        var handler = $rootScope.$on('notify-service-event', callback);
        scope.$on('$destroy', handler);
      };

      var notify = function() {
        $rootScope.$emit('notify-service-event');
      }

      return {
        subscribe: subscribe,
        notify: notify
      };
    }];
  module.factory('NotifyService', NotifyServiceFactory);
})(angular);
