(function(angular) {
  var module = angular.module('pockeyt.directives.view-loaded', []);

  module.directive('elemReady', function($parse, $timeout) {

    return {
      restrict: 'A',
      link: function($scope, elem, attrs) {
        $timeout(function() {
          elem.ready(function() {
            $scope.$apply(function() {
              var func = $parse(attrs.elemReady);
            })
          })
        })
      }
    };
  });
})(angular);