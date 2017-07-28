(function(angular) {

  var module = angular.module('pockeyt.directives.date-picker', ['pockeyt.repositories.events']);

  module.directive('datePicker', ['eventsRepository', function(repository) {
    return {
      restrict: 'EA',
      scope: {},
      templateUrl: 'templates/directives/date-picker.html',
      replace: true,
      'controller': function($scope) {
        $scope.loadDate= function(n) {
          $scope.selectedDate = n;
        };
        $scope.dateToday = function() {
          if($scope.selectedDate === "today" || !angular.isDefined($scope.selectedDate)) {
            return true;
          } else {
            return false;
          } 
        };
        $scope.dateTomorrow = function() {
          if($scope.selectedDate === "tomorrow") {
            return true;
          } else {
            return false;
          }
        };
        $scope.dateWeek = function() {
          if($scope.selectedDate === "week") {
            return true;
          } else {
            return false;
          }
        };
        $scope.dateWeekend = function() {
          if($scope.selectedDate === "weekend") {
            return true;
          } else {
            return false;
          }
        };
      },
      link: function($scope, attrs) {
        $scope.$evalAsync(function () {
          $scope.$watch('selectedDate', function (val) {
            repository.doEvents(val);
          });
        });
      }
    };

  }]);

})(angular);