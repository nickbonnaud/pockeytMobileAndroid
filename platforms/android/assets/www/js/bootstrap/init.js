(function(angular) {

  var boot = function() {
    angular.injector(['ng', 'pockeyt.bootstrap.services.config']).get('pockeytConfig').get().then(function(config) {
      angular.module('pockeyt.config', []).constant('CONFIG', config);
      angular.bootstrap(document.getElementById('pockeyt-app'), ['pockeyt']);
    });
  };

  if(typeof window.cordova !== 'undefined') {
    document.addEventListener("deviceready", function() {
      branchInit();
      if(typeof analytics !== "undefined") { analytics.startTrackerWithId("UA-78998161-2");}
      boot();
    }, false);
    document.addEventListener("resume", function() {
      branchInit();
    }, false);
  } else {
    boot();
  };

  var branchInit = function() {
    Branch.initSession(function(data) {
      console.log('Deep Link Data: ' + JSON.stringify(data));
    });
  };
})(angular);





