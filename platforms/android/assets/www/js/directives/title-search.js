(function(angular) {

  var module = angular.module('pockeyt.directives.title-search', ['ngAnimate', 'pockeyt.repositories.favorites', 'pockeyt.repositories.partners']);

  var Controller = function($state, $scope) {
    $scope.currentState = $state.current.name;
    this.expanded = false;
  };

  Controller.prototype.show = function() {
    this.expanded = true;
  };
  Controller.prototype.hide = function() {
    this.expanded = false;
    this.input = "";
  };
  Controller.prototype.toggle = function() {
    this.expanded = !this.expanded;
  };
  Controller.prototype.go = function() {             
      if (event.keyCode === 13) {
          cordova.plugins.Keyboard.close();
          event.preventDefault();
      }
  };

  module.directive('titleSearch', ['$animate', 'favoritesRepository','partnersRepository','businessesRepository', function($animate, favoritesRepository, partnersRepository, businessesRepository) {
    return {
      restrict: 'EA',
      scope: {},
      controller: Controller,
      controllerAs: 'search',
      templateUrl: 'templates/directives/title-search.html',
      replace: true,
      link: function($scope, $element, attrs) {
        $scope.expanded = false;
        $scope.$watch('search.expanded', function(val) {
          $animate[val ? 'addClass' : 'removeClass']($element, 'expanded');
        });
        $scope.$evalAsync(function () {
          $scope.$watch('search.input', function (newVal, oldVal) {
            if (angular.isDefined(newVal)) {
              businessesRepository.doSearch(newVal);
            }
          });
        });
      }
    };

  }]);

})(angular);