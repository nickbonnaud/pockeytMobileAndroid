(function(angular) {

  var module = angular.module('pockeyt.controllers.blogs', ['pockeyt.repositories.blogs', 'pockeyt.services.my-pockeyt']);

  var BlogsController = function($rootScope, $scope, allPartners, repository, MyPockeyt) {
    if(typeof analytics !== "undefined") { analytics.trackView("Blog View"); }
    this.partners = {};

    angular.element(document).ready(function () {
      $rootScope.viewLoaded = true;
    });

    $scope.parentShareContent = function(top) {
      if(typeof analytics !== "undefined") { analytics.trackEvent("Share Button", "Blog", top.blog_title, top.id); }
      this.window.plugins.socialsharing.shareViaSMS('I found this on Pockeyt http://pockeytbiz.com/blogs/' + top.id);
    };

    this.update(allPartners);

    $scope.$watch(function() {return repository.allCached();}, function(val) {
      this.update(val);
    }.bind(this), true);

    $scope.loadMore = function() {
      repository.loadMore();
    };

    $scope.isLoading = function() {
      return repository.isLoading;
    };

  };

  BlogsController.prototype.update = function(partners) {
    this.partners.all = partners;
  };

  module.controller('BlogsController', ['$rootScope', '$scope', 'allPartners', 'blogsRepository', 'MyPockeyt', BlogsController]);

})(angular);