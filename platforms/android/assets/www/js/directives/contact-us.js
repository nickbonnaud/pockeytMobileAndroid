(function(angular) {

  var module = angular.module('pockeyt.directives.contact-us', []);

  module.directive('contactUs', function() {

    return {
      restrict: 'AE',
      scope: {},
      templateUrl: 'templates/directives/contact-us.html',
      replace: true,
      'controller': function($scope) {
        $scope.emailUs = function() {
          window.plugins.socialsharing.shareViaEmail(
            '',
            'Contact Pockeyt',
            ['contact@pockeyt.com'],
            null,
            null,
            null
          );
        };
      }
    };
  });
})(angular);