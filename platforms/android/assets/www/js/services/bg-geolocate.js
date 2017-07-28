(function(angular) {

  var module = angular.module('pockeyt.services.bg-geolocate', ['pockeyt.services.geolocation-auth', 'pockeyt.services.api', 'pockeyt.services.notify-service']);

  var bgGeolocateFactory = [
    '$rootScope',
    '$auth',
    '$q',
    'geolocationAuth',
    'PockeytApi',
    'NotifyService',
    function($rootScope, $auth, $q, geolocationAuth, api, NotifyService) {
        $rootScope.userAcceptGeo = geolocationAuth.loadGeoAcceptedFromStorage();
        var userStationarySet = false;
        var processing = false;
        var initialLoad = false;
        var _currentLocations = [];
        var powerLocation = false;
        var appLocationServicesOn = false;

        var inLocations = function() {
            console.log(_currentLocations);
            return _currentLocations;
        };

        var getGeoState = function() {
            var defer = $q.defer();
            backgroundGeolocation.isLocationEnabled(function(enabled) {
                defer.resolve(enabled);
            });
            return defer.promise;
        };

        var showSettings = function() {
            return backgroundGeolocation.showLocationSettings();
        };

        var showAppSettings = function() {
            backgroundGeolocation.showAppSettings();
            return initGeo();
        };

        var setStationaryConfig = function() {
            backgroundGeolocation.stop();
            backgroundGeolocation.configure(sendLocation, locationFail, {
                locationProvider: backgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
                desiredAccuracy: 10,
                stationaryRadius: 50,
                interval: 60000,
                fastestInterval: 60000,
                activitiesInterval: 60000,
                stopOnStillActivity: false,
                debug: false,
                stopOnTerminate: true,
                startOnBoot: false,
                maxLocations: 1
            });
            userStationarySet = true;
            console.log("set stationary");
            backgroundGeolocation.start();
        };

        var removeStationaryConfig = function() {
            _currentLocations = undefined;
            backgroundGeolocation.stop();

            backgroundGeolocation.configure(sendLocation, locationFail, {
                locationProvider: backgroundGeolocation.provider.ANDROID_DISTANCE_FILTER_PROVIDER,
                desiredAccuracy: 10,
                stationaryRadius: 20,
                distanceFilter: 50,
                debug: false,
                stopOnTerminate: true,
                startOnBoot: false,
                maxLocations: 1
            });
            userStationarySet = false;
            console.log("remove stationary");
            backgroundGeolocation.start();
        }

        var config = function() {
            backgroundGeolocation.configure(sendLocation, locationFail, {
                desiredAccuracy: 10,
                stationaryRadius: 20,
                distanceFilter: 50,
                locationProvider: backgroundGeolocation.provider.ANDROID_DISTANCE_FILTER_PROVIDER,
                debug: false,
                stopOnTerminate: true,
                startOnBoot: false,
                maxLocations: 1
            });
        };

    	var initGeo = function() {
			config();
            watchGeoSetting();
            return backgroundGeolocation.start();
    	};

        var sendLocation = function(location) {
            appLocationServicesOn = true;
            console.log(location);
            if (userStationarySet) {
                var is_heartbeat = true;
            } else {
                var is_heartbeat = false;
            }

            var params = {
                'is_heartbeat': is_heartbeat,
                'coords': {
                    'latitude': location.latitude,
                    'longitude': location.longitude
                }
            };
            api.request('/geo', params, 'POST')
                .then(function(response) {
                    console.log(response);
                    if (response.data.length == 0) {return;}
                    console.log("after check for length");
                    if (response.data === 'none') {
                        _currentLocations = [];
                        if (userStationarySet || powerLocation) {
                            powerLocation = false;
                            removeStationaryConfig();
                        }
                        return backgroundGeolocation.finish();;
                    } else if ((response.data !== 'none')) {
                        var _locations = response.data;
                        for(var i = 0; i < _locations.length; i++) {
                           addCurrentLocations(_locations[i]);
                        }
                        for(var i = 0; i < _currentLocations.length; i++) {
                           var index = removeSavedLocationIndex(_locations, _currentLocations[i]);
                           if (index == -1) {
                                console.log("REMOVE " + _currentLocations[i].location_id);
                                _currentLocations.splice(i, 1);
                           }
                        }
                        if (!userStationarySet || powerLocation) {
                            powerLocation = false;
                            setStationaryConfig();
                        }
                        return backgroundGeolocation.finish();
                    }
                })
                .catch(function(err) {
                    console.log(err);
                    backgroundGeolocation.finish();
                });
        };

        var getCurrentPosition = function() {
            powerLocation = true;
            backgroundGeolocation.stop();
            backgroundGeolocation.configure(sendLocation, locationFail, {
                desiredAccuracy: 0,
                stationaryRadius: 20,
                distanceFilter: 20,
                locationProvider: backgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
                interval: 1000,
                fastestInterval: 1000,
                activitiesInterval: 60000,
                stopOnStillActivity: false,
                debug: false,
                stopOnTerminate: true,
                startOnBoot: false,
                maxLocations: 1
            });
            backgroundGeolocation.start();
        };

        var watchGeoSetting = function() {
            backgroundGeolocation.watchLocationMode(function(enabled) {
                if (!enabled) {
                    return notifyLocationServices();
                }
            })
        };

        var notifyLocationServices = function() {
            return navigator.notification.confirm(
                "Location Services disabled! Location Services are required for payments to work.",
                function(buttonIndex) {
                    if (buttonIndex == 2) {
                        return showSettings();
                    }
                },
                "Location Services Off",
                ['Cancel', 'Location Settings']
            );
        };

        var locationFail = function(error) {
            console.log(error);
            backgroundGeolocation.finish();
        };

        var initialInit = function() {
            backgroundGeolocation.isLocationEnabled(function(enabled) {
                if (!enabled) {
                    return notifyLocationServices();
                } else {
                    return initGeo();
                }
            });
        };

        var getAppLocationServices = function() {
            return appLocationServicesOn;
        };

        var addCurrentLocations = function(location) {
            if (_currentLocations.length > 0) {
                console.log(_currentLocations);
                console.log(location);
                var locationIndex = searchCurrentLocations(location.location_id);
                if (locationIndex == -1) {
                    console.log("ADD " + location.location_id);
                    return _currentLocations.push(location);
                } else {
                    return;
                }
            } else {
                console.log(_currentLocations);
                console.log(location);
                console.log("ADD " + location.location_id);
                return _currentLocations.push(location);
            }
        };

        var removeCurrentLocations = function(locationId) {
            if (_currentLocations.length > 0) {
                console.log(_currentLocations);
                console.log(locationId);
                var locationIndex = searchCurrentLocations(locationId);
                if (locationIndex != -1) {
                    console.log("REMOVE " + location.locationId);
                    return _currentLocations.splice(locationIndex, 1);
                } else {
                    return;
                }
            } else {
                return;
            }
        };

        var removeSavedLocationIndex = function(_locations, currentLocation) {
             for(var i = 0; i < _locations.length; i++) {
              if(_locations[i].location_id == currentLocation.location_id) return i;
            }
            return -1;
        }

        var searchCurrentLocations = function(locationId) {
            for(var i = 0; i < _currentLocations.length; i++) {
              if(_currentLocations[i].location_id == locationId) return i;
            }
            return -1;
        };

    	return {
            notifyLocationServices: notifyLocationServices,
            initialInit: initialInit,
            sendLocation: sendLocation,
            locationFail: locationFail,
            setStationaryConfig: setStationaryConfig,
            removeStationaryConfig: removeStationaryConfig,
    		config: config,
    		initGeo: initGeo,
            getCurrentPosition: getCurrentPosition,
            inLocations: inLocations,
            getGeoState: getGeoState,
            showSettings: showSettings,
            watchGeoSetting: watchGeoSetting,
            getAppLocationServices: getAppLocationServices,
            showAppSettings: showAppSettings,
            addCurrentLocations: addCurrentLocations,
            removeCurrentLocations: removeCurrentLocations,
            removeSavedLocationIndex: removeSavedLocationIndex,
            searchCurrentLocations: searchCurrentLocations

    	};

    }];
  module.factory('bgGeolocate', bgGeolocateFactory);
})(angular);