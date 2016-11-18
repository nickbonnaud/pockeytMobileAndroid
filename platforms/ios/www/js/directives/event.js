(function(angular) {

  var module = angular.module('pockeyt.directives.event', []);

  module.directive('eventListItem', function() {

    return {
      restrict: 'AE',
      scope: {
        partner: '=eventListItem',
        'shareContent': '&',
        'toggleFavorite': '&',
        'isFavorite': '&',
        'searchActive': '&',
        'toggleBookmark': '&',
        'isBookmark': '&'
      },
      templateUrl: 'templates/directives/event-list-item.html',
      replace: true,
      /**
       *
       * @param {{partner: Partner}} $scope
       * @param {jQuery} $elem
       * @param {Object<string,string>} attrs
       */
      link: function($scope, $elem, attrs) {
        $scope.lockIfUnlocked = function() {
          if($scope.partner.unlocked) $scope.partner.lock();
        };
        $scope.feedentry = (typeof attrs.feedentry !== 'undefined');
      }
    };
  });
})(angular);