(function(angular) {

  var module = angular.module('pockeyt.controllers.pay', ['pockeyt.services.api']);

  var PayController = function($scope, api) {
    if(typeof analytics !== "undefined") { analytics.trackView("Pay View"); }

    $scope.openPayForm = function() {
    	return api.request('/token/client')
    		.then(function(response) {
    			var token = response.data.clientToken;
    			BraintreePlugin.initialize(token,
					  function () { console.log("init OK!"); },
					  function (error) { console.error(error); 
					});

    			var options = {
				    cancelText: "Cancel",
				    title: "Add Card",
				    ctaText: "ADD Payment Method",
					};

    			BraintreePlugin.presentDropInPaymentUI(options, function (result) {
					    if (result.userCancelled) {
					        console.debug("User cancelled payment dialog.");
					    }
					    else {
					    	console.log('completed');
					    }
					});
    		})
    		.catch(function(response) {
    			console.log(response);
    		});
		};
		$scope.openPayForm();
  };

  module.controller('PayController', ['$scope', 'PockeytApi', PayController]);
})(angular);