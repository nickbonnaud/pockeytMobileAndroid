(function(angular) {

  var module = angular.module('pockeyt.controllers.profile', ['pockeyt.services.api', 'pockeyt.services.user-service']);

  var ProfileController = function($scope, $auth, $state, api, UserService, user) {
    if(typeof analytics !== "undefined") { analytics.trackView("Profile View"); }

    $scope.isActive = false;
    $scope.user = user;
    $scope.passwordChange = false;

    $scope.changePassword = function() {
      $scope.passwordChange = !$scope.passwordChange;
    }

    $scope.updateProfile = function() {
      return api.request('/update', $scope.user, 'PUT')
        .then(function(response) {
          $auth.setToken(response.data.dbUser.token);
          $scope.user = response.data.dbUser;
          $state.go('main.menu.profile', null, {reload: true})
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

    $scope.openFilePicker = function() {
        navigator.camera.getPicture(uploadPhoto, function (message) {
         console.log(message); },  {
                quality: 100, 
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: false
              }
        );
    };

    function uploadPhoto(imageURI) {
      console.log(imageURI);
      var options = new FileUploadOptions();
      var headers = {'Connection': 'close', 'Authorization': 'Bearer ' + $auth.getToken()};
      options.fileKey="file";
      options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
      options.mimeType="image/jpeg";
      options.headers = headers;
      options.chunkedMode = false;

      var ft = new FileTransfer();
      ft.upload(imageURI, encodeURI('https://pockeytbiz.com/api/authenticate/user/photo'), win, fail, options);
    };

    function win(r) {
      var user = JSON.parse(r.response);
      UserService.updateUser(user.user);
      return $state.go('main.menu.profile', null, {reload: true});
    };

    function fail(error) {
        alert("An error has occurred: Code = " + error.code);
    };

    $scope.checkDevice = function() {
      if(device.platform === "iOS") {
        return 'icon ea-icon-ios-back';
      } else {
        return 'icon ea-icon-android-back';
      }
    };

    $scope.addPayment = function() {
      if ($scope.user.email == null) {
        return navigator.notification.alert(
          'Email required to add payment. Please set to continue.',
          function() {
            $state.go('main.menu.profile.edit');
          },
          'Please Set Email',
          'Go'
        );
      }
      var token = $auth.getToken();
      var ref = window.open('https://pockeytbiz.com/api/vault/card?token=' + token, '_blank', 'location=no');
      ref.addEventListener('loadstop', function(event) {     
        if (event.url.match("mobile/close/success")) {
          UserService.clearIdentity();
          ref.close();
          window.plugins.toast.showWithOptions({
            message: "Success! Card stored.",
            duration: "short",
            position: "center",
            styling: {
              backgroundColor: '#20ba12'
            }
          });
          return $state.go('main.menu.profile.tip-select', null, {reload: true});
        } else if(event.url.match("mobile/close/fail")) {
          ref.close();
          window.plugins.toast.showWithOptions({
            message: "oops! Something went wrong. Please try again later",
            duration: "short",
            position: "center",
            styling: {
              backgroundColor: '#ef0000'
            }
          });
          return $state.go('main.menu.profile', null, {reload: true});
        }
      });
    };
  };



  module.controller('ProfileController', ['$scope', '$auth', '$state', 'PockeytApi', 'UserService', 'user', ProfileController]);
})(angular);