(function(angular) {

  var module = angular.module('pockeyt.controllers.events', ['pockeyt.repositories.events', 'pockeyt.services.my-pockeyt', 'pockeyt.services.bookmark', 'pockeyt.services.interaction-post']);

  var EventsController = function($rootScope, $scope, allPartners, repository, MyPockeyt, Bookmark, InteractionPost) {
    if(typeof analytics !== "undefined") { analytics.trackView("Events View"); }
    this.partners = {};
    this.update(allPartners);
    $scope.hasMore = function() {
      return repository.hasMore;
    };
    $scope.empty = function() {
      return repository.empty;
    };

    angular.element(document).ready(function () {
      $rootScope.viewLoaded = true;
    });

    $scope.$watch(function() {return repository.getSelectedDate();}, function(selectedDate) {
      var cache = repository.allCached();
      this.update(cache);
    }.bind(this), true);

    $scope.parentShareContent = function(top) {
      if(typeof analytics !== "undefined") { analytics.trackEvent("Share Button", "Events", top.message); }
      this.window.plugins.socialsharing.shareViaSMS('I found this on Pockeyt http://pockeytbiz.com/posts/' + top.id, null,
        function(msg) {
          if (msg) {
            var type = 'share';
            InteractionPost.buttonInteraction(type, top);
          }
        }, 
        function(msg) {
          console.log(msg);
        }
      );
    };

    $scope.loadMore = function() {
      return repository.loadMore();
    };

    $scope.isLoading = function() {
      return repository.isLoading;
    };
  };

  EventsController.prototype.update = function(partners) {
    this.partners.all = partners;
  };

  module.controller('EventsController', ['$rootScope', '$scope', 'allPartners', 'eventsRepository', 'MyPockeyt', 'Bookmark', 'InteractionPost', EventsController]);

})(angular);