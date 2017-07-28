(function(angular) {
  var pockeyt = angular.module('pockeyt.controllers.signup', ['pockeyt.services.api', 'pockeyt.services.notification']);

  var SignupController = function($rootScope, $scope, $auth, $state, api, Notification) {
    $scope.unlocked = false;

    $scope.sendCode = function() {
      var payload = {
        inviteCode: $scope.invite_code
      };
      api.request('/invites/user/check', payload, 'POST')
        .then(function(resp) {
          if (resp.data == 'unlock') {
            return $scope.unlocked = true;
          } else if(resp.data == 'used') {
            var message = "Sorry that code has already been used.";
            return flashError(message);
          } else {
            var message = "Sorry that code is invalid.";
            return flashError(message);
          }
        })
        .catch(function(err) {
          window.plugins.toast.showWithOptions({
              message: "oops! Something went wrong. Please try again later",
              duration: "long",
              position: "center",
              styling: {
                  backgroundColor: '#ef0000'
              }
          });
        });
    };

    var flashError = function(message) {
      window.plugins.toast.showWithOptions({
          message: message,
          duration: "long",
          position: "center",
          styling: {
              backgroundColor: '#ef0000'
          }
      });
    };

    $scope.signup = function() {
      var user = {
        first_name: $scope.first_name,
        last_name: $scope.last_name,
        email: $scope.email,
        password: $scope.password
      }
      $auth.signup(user)
        .then(function(response) {
          if (response.data.email === undefined) {
            $auth.setToken(response.data.user.token);
            var payload = {
              push_token: Notification.loadTokenFromStorage()
            };
            api.request('/token/sync', payload, 'POST')
            .then(function(response) {
              console.log(response);
            })
            .catch(function(err) {
              console.log(err);
            });
            $state.go('main.menu.profile', {}, {reload: true});
          } else {
            window.plugins.toast.showWithOptions({
              message: "Sorry that email is taken",
              duration: "short",
              position: "center",
              styling: {
                backgroundColor: '#ef0000'
              }
            });
          }
        })
        .catch(function(response) {
          window.plugins.toast.showWithOptions({
            message: "oops! Something went wrong. Try again",
            duration: "short",
            position: "center",
            styling: {
              backgroundColor: '#ef0000'
            }
          });
        });
    };
    
    $scope.facebookSignIn = function() {
      var fbLoginSuccess = function (userData) {
        facebookConnectPlugin.getAccessToken(function(token) {
          $scope.fbToken = { token : token };
          return api.request('/facebook', $scope.fbToken, 'POST')
            .then(function(response) {
              $auth.setToken(response.data.user.token);
              var payload = {
                push_token: Notification.loadTokenFromStorage()
              };
              api.request('/token/sync', payload, 'POST')
              .then(function(response) {
                console.log(response);
              })
              .catch(function(err) {
                console.log(err);
              });
              $state.go('main.menu.profile', {}, {reload: true});
            })
            .catch(function(response) {
              window.plugins.toast.showWithOptions({
                message: "oops! Something went wrong. Try again",
                duration: "short",
                position: "center",
                styling: {
                  backgroundColor: '#ef0000'
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
    };
  };
  pockeyt.controller('SignupController', ['$rootScope', '$scope', '$auth', '$state', 'PockeytApi', 'Notification', SignupController]);
})(angular);