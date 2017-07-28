(function(angular) {

  var module = angular.module('pockeyt.services.interaction-post', ['pockeyt.services.api']);

  var InteractionPostFactory = [
    'PockeytApi',
    function(api) {

      var buttonInteraction = function(type, post, action) {
        var payload = {
          type: type,
          postId: post.id,
          action: action
        };
        return api.request('/analytics/posts/interaction', payload, 'POST')
        .then(function(response) {
          console.log(response);
        })
        .catch(function(err) {
          console.log(err);
        });
      };
      return {
        buttonInteraction: buttonInteraction
      };
    }];
  module.factory('InteractionPost', InteractionPostFactory);
})(angular);
