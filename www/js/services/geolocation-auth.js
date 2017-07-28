(function(angular) {

  var module = angular.module('pockeyt.services.geolocation-auth', ['LocalStorageModule']);

  module.constant('GEO_ACCEPTED_KEY', 'pockeyt.services.geo.accepted');
  module.constant('GEO_ACCEPTED_LOADED_EVENT', 'pockeyt.services.geo.accepted-loaded');

  var geolocationAuthFactory = [
  	'GEO_ACCEPTED_KEY',
  	'GEO_ACCEPTED_LOADED_EVENT',
    '$rootScope',
    '$auth',
    'localStorageService',
    '$q',
    '$rootScope',
    function(GEO_KEY, GEO_ACCEPTED_LOADED_EVENT, $rootScope, $auth, storage, $q, $rootScope) {
    	
    	var getGeoAccepted = function() {
    		if(storage.get(GEO_KEY))
    			return $q.resolve(storage.get(GEO_KEY));
    		else {
    			return $q(function(resolve, reject) {
    				var dereg = $rootScope.$on(GEO_ACCEPTED_LOADED_EVENT, function() {
    					dereg();
    					resolve(storage.get(GEO_KEY));
    				});
    			});
    		}
    	};

    	var loadGeoAcceptedFromStorage = function() {
    		var accepted = storage.get(GEO_KEY);
    		if (angular.isUndefined(accepted) || accepted === null) {
    			storage.set(GEO_KEY, false);
    			$rootScope.$broadcast(GEO_ACCEPTED_LOADED_EVENT);
    			return getGeoAccepted();
    		} else {
    			$rootScope.$broadcast(GEO_ACCEPTED_LOADED_EVENT);
    			return accepted;
    		}
    	};

    	var toggleGeoAccepted = function() {
            var accepted = storage.get(GEO_KEY);
    		accepted = !accepted;
    		return storage.set(GEO_KEY, accepted) ? $q.resolve(accepted) : $q.reject(new Error('Failed to store geolocation setting.'));
    	};

        var setGeoAccepted = function(geoSettings) {
            var accepted = geoSettings;
            return storage.set(GEO_KEY, accepted) ? $q.resolve(accepted) : $q.reject(new Error('Failed to store geolocation setting.'));
        };

    	return {
    		getGeoAccepted: getGeoAccepted,
    		loadGeoAcceptedFromStorage: loadGeoAcceptedFromStorage,
    		toggleGeoAccepted: toggleGeoAccepted,
            setGeoAccepted: setGeoAccepted
    	};

    }];
  module.factory('geolocationAuth', geolocationAuthFactory);
})(angular);