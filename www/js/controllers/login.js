(function(angular) {
  var pockeyt = angular.module('pockeyt.controllers.login', ['pockeyt.services.api', 'pockeyt.services.bg-geolocate', 'pockeyt.services.user-service']);

  var LoginController = function($scope, $auth, $state, api, bgGeolocate, UserService) {
    $scope.login = function() {
      var user = {
        email: $scope.user.email,
        password: $scope.user.password
      };
      $auth.login(user)
        .then(function(response) {
          $auth.setToken(response.data.user.token);
          return UserService.identity()
          .then(function(identity) {
            console.log(identity);
            if ((angular.isDefined(identity)) && (identity.customer_id !== null)) {
              if (identity.default_tip_rate !== null) {
                bgGeolocate.initGeo();
                return $state.go('main.menu.profile', {}, {reload: true});
              } else {
                navigator.notification.alert(
                  'You have set your payment method but have not specified a default tip rate. Please set to continue.',
                  function() {
                    $state.go('main.menu.profile.tip-select');
                  },
                  'Set Default Tip',
                  'Set Rate'
                );
                return $state.go('main.menu.profile', {}, {reload: true});
              }
            } else {
              return $state.go('main.menu.profile', {}, {reload: true});
            }
          });
        })
        .catch(function(error) {
          if (error.status === 401) {
            return window.plugins.toast.showWithOptions({
              message: "oops! Your password or email is incorrect",
              duration: "short",
              position: "center",
              styling: {
                backgroundColor: '#ef0000'
              }
            });
          } else {
            return window.plugins.toast.showWithOptions({
              message: "oops! Something went wrong. Try again",
              duration: "short",
              position: "center",
              styling: {
                backgroundColor: '#ef0000'
              }
            });
          }
        });
    };
    $scope.authenticateFB = function() {
      facebookConnectPlugin.getLoginStatus(function onLoginStatus(userData) {
        if (userData.status === 'connected') {
          var fbID = { fbID: userData.authResponse.userID};
          return api.request('/authenticate', fbID, 'POST')
            .then(function(response) {
                $auth.setToken(response.data.user.token);
                return UserService.identity()
                .then(function(identity) {
                  if ((angular.isDefined(identity)) && (identity.customer_id !== null)) {
                    if (identity.default_tip_rate !== null) {
                      bgGeolocate.initGeo();
                      return $state.go('main.menu.profile', {}, {reload: true});
                    } else {
                      navigator.notification.alert(
                        'You have set your payment method but have not specified a default tip rate. Please set to continue.',
                        function() {
                          $state.go('main.menu.profile.tip-select');
                        },
                        'Set Default Tip',
                        'Set Rate'
                      );
                      return $state.go('main.menu.profile', {}, {reload: true});
                    }
                  } else {
                    return $state.go('main.menu.profile', {}, {reload: true});
                  }
                });
            });
        } else {
          var fbLoginSuccess = function (userData) {
            facebookConnectPlugin.getAccessToken(function(token) {
              $scope.fbToken = { token : token };
              return api.request('/facebook', $scope.fbToken, 'POST')
                .then(function(response) {
                  $auth.setToken(response.data.user.token);
                  return UserService.identity()
                  .then(function(identity) {
                    if ((angular.isDefined(identity)) && (identity.customer_id !== null)) {
                      if (identity.default_tip_rate !== null) {
                        bgGeolocate.initGeo();
                        return $state.go('main.menu.profile', {}, {reload: true});
                      } else {
                        navigator.notification.alert(
                          'You have set your payment method but have not specified a default tip rate. Please set to continue.',
                          function() {
                            $state.go('main.menu.profile.tip-select');
                          },
                          'Set Default Tip',
                          'Set Rate'
                        );
                        return $state.go('main.menu.profile', {}, {reload: true});
                      }
                    } else {
                      return $state.go('main.menu.profile', {}, {reload: true});
                    }
                  });
                });
            });
          };
          facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess,
            function loginError (error) {
              console.error(error)
            }
          );
        }
      });
    };
  };
  pockeyt.controller('LoginController', ['$scope', '$auth', '$state', 'PockeytApi', 'bgGeolocate', 'UserService', LoginController]);
})(angular);