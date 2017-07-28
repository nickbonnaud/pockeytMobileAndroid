(function(angular) {

  var module = angular.module('pockeyt.controllers.location-settings', ['pockeyt.services.bg-geolocate', 'pockeyt.services.notify-service']);

  var LocationSettingsController = function($rootScope, $scope, $state, bgGeolocate, NotifyService, geoSettingPhone, geoSettingApp) {
    if(typeof analytics !== "undefined") { analytics.trackView("Location Settings View"); }

    $scope.toggle = geoSettingApp;
    $scope.geoSettingPhone = geoSettingPhone;

    $scope.showLocationServices = function() {
    	return navigator.notification.confirm(
        "Go to Location Services Settings?",
        function(buttonIndex) {
          if (buttonIndex == 2) {
            bgGeolocate.showSettings();
            return $state.go('main.menu');
          }
        },
        "Edit Location Services",
        ['Cancel', 'Location Settings']
	    );
    };

    $scope.checkDevice = function() {
      if(device.platform === "iOS") {
        return 'icon ea-icon-ios-back';
      } else {
        return 'icon ea-icon-android-back';
      }
    };

    $scope.getLocation = function() {
    	return bgGeolocate.getCurrentPosition();
    };

    var start     = {};
	  var touchMove = false;
	  var distanceX = false;
	  var toggle    = false;

	  var findToggle = function (target) {
	    var i;
	    var toggles = document.querySelectorAll('.toggle');

	    for (; target && target !== document; target = target.parentNode) {
	      for (i = toggles.length; i--;) {
	        if (toggles[i] === target) {
	          return target;
	        }
	      }
	    }
	  };

	  window.addEventListener('touchstart', function (e) {
	    e = e.originalEvent || e;

	    toggle = findToggle(e.target);

	    if (!toggle) {
	      return;
	    }

	    var handle      = toggle.querySelector('.toggle-handle');
	    var toggleWidth = toggle.clientWidth;
	    var handleWidth = handle.clientWidth;
	    var offset      = toggle.classList.contains('active') ? (toggleWidth - handleWidth) : 0;

	    start     = { pageX : e.touches[0].pageX - offset, pageY : e.touches[0].pageY };
	    touchMove = false;
	  });

	  window.addEventListener('touchmove', function (e) {
	    e = e.originalEvent || e;

	    if (e.touches.length > 1) {
	      return; // Exit if a pinch
	    }

	    if (!toggle) {
	      return;
	    }

	    var handle      = toggle.querySelector('.toggle-handle');
	    var current     = e.touches[0];
	    var toggleWidth = toggle.clientWidth;
	    var handleWidth = handle.clientWidth;
	    var offset      = toggleWidth - handleWidth;

	    touchMove = true;
	    distanceX = current.pageX - start.pageX;

	    if (Math.abs(distanceX) < Math.abs(current.pageY - start.pageY)) {
	      return;
	    }

	    e.preventDefault();

	    if (distanceX < 0) {
	      return (handle.style.webkitTransform = 'translate3d(0,0,0)');
	    }
	    if (distanceX > offset) {
	      return (handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)');
	    }

	    handle.style.webkitTransform = 'translate3d(' + distanceX + 'px,0,0)';

	    toggle.classList[(distanceX > (toggleWidth / 2 - handleWidth / 2)) ? 'add' : 'remove']('active');
	  });

	  window.addEventListener('touchend', function (e) {
	    if (!toggle) {
	      return;
	    }

	    var handle      = toggle.querySelector('.toggle-handle');
	    var toggleWidth = toggle.clientWidth;
	    var handleWidth = handle.clientWidth;
	    var offset      = (toggleWidth - handleWidth);
	    var slideOn     = (!touchMove && !toggle.classList.contains('active')) || (touchMove && (distanceX > (toggleWidth / 2 - handleWidth / 2)));

	    if (slideOn) {
	      handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)';
	    } else {
	      handle.style.webkitTransform = 'translate3d(0,0,0)';
	    }

	    if (slideOn) {
	    	handle.style.webkitTransform = 'translate3d(0,0,0)';
	    	toggle.classList.remove('active');
	    	bgGeolocate.showAppSettings();
	    	return $state.go('main.menu');
	    } else {
	    	bgGeolocate.showAppSettings();
	    	return $state.go('main.menu');
	    	toggle.classList[slideOn ? 'add' : 'remove']('active');

		    e = new CustomEvent('toggle', {
		      detail: { isActive: slideOn },
		      bubbles: true,
		      cancelable: true
		    });

		    toggle.dispatchEvent(e);

		    touchMove = false;
		    toggle    = false;
	    }
	  });

	  NotifyService.subscribe($scope, function somethingChanged() {
	    if (!toggle) {
	      return;
	    }
	    $scope.$apply(function() {
	    	$scope.geoSettingPhone = true;
	    });
	    var handle      = toggle.querySelector('.toggle-handle');
	    var toggleWidth = toggle.clientWidth;
	    var handleWidth = handle.clientWidth;
	    var offset      = (toggleWidth - handleWidth);

	    handle.style.webkitTransform = 'translate3d(' + offset + 'px,0,0)';

	    toggle.classList.add('active');

	    e = new CustomEvent('toggle', {
	      detail: { isActive: true },
	      bubbles: true,
	      cancelable: true
	    });

	    toggle.dispatchEvent(e);

	    touchMove = false;
	    toggle    = false;
    });


  };

  module.controller('LocationSettingsController', ['$rootScope', '$scope', '$state', 'bgGeolocate', 'NotifyService', 'geoSettingPhone', 'geoSettingApp', LocationSettingsController]);
})(angular);