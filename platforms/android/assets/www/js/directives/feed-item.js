(function(angular) {

  var module = angular.module('pockeyt.directives.feed-item', []);

  module.directive('feedListItem', function() {

    return {
      restrict: 'AE',
      scope: {
        post: '=feedListItem',
        'shareContent': '&',
        'openMenu': '&',
        'purchasePost': '&'
      },
      templateUrl: 'templates/directives/feed-list-item.html',
      replace: true,
    };
  });
})(angular);