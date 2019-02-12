(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['CommonConstants', '$rootScope', '$state', '$timeout', 'Auth', 'ProfileService', '$interval'];

    function LoginController(CommonConstants, $rootScope, $state, $timeout, Auth, ProfileService, $interval) {
        var vm = this;

        vm.cancel = cancel;
        vm.secondaryAuthenticate = secondaryAuthenticate;
        vm.login = login;
        vm.register = register;
        vm.requestResetPassword = requestResetPassword;
        vm.needSecondaryAuth = needSecondaryAuth;

        vm.authenticationError = false;
        vm.isSecondAuthRequested = false;
        vm.credentials = {};
        vm.password = null;
        vm.authNumber = null;
        vm.rememberMe = true;
        vm.userId = null;

        $timeout(function () {
            angular.element('#userId').focus();
        });

        ProfileService.getProfileInfo().then(function (response) {
            vm.profileInfos = response;
        });

        function needSecondaryAuth() {
            return CommonConstants.needSecondaryAuthUsers.indexOf(vm.userId) > -1;
        }

        function cancel() {
            vm.credentials = {
                userId: null,
                password: null,
                rememberMe: true
            };
            vm.authenticationError = false;
            //$uibModalInstance.dismiss('cancel');
        }

        function secondaryAuthenticate(event) {
            if (event) event.preventDefault();
            if (vm.userId === '' || vm.password === '') return;
            Auth.secondaryAuthenticateForLogin({
                userId: vm.userId,
                password: vm.password
            }).then(function () {
                window.localStorage.setItem('loginStatus', 'success');
                vm.authenticationError = false;
                vm.isSecondAuthRequested = true;
                $timeout(function(){ $('div.login-wrap > div > input[id=authNumber]').focus();}, 500);
                secondCheck();
            }).catch(function (error) {
                vm.authNumber = '';
                vm.authenticationError = true;
                vm.isSecondAuthRequested = false;
                if (error.data.message && error.data.message == 'User withdrawing') {
                    vm.authenticationErrorMessage = 'login.messages.error.withdrawing';
                } else if (error.data.message && error.data.message == 'User registering') {
                    vm.authenticationErrorMessage = 'login.messages.error.registering';
                } else {
                    vm.authenticationErrorMessage = error.data.description;
                    if (vm.authenticationErrorMessage == '운영자가 아닙니다.') vm.forAdmin = false;
                }
            });
        }

        function login(event) {
            if (event) event.preventDefault();
            if (vm.userId === '' || vm.password === '') return;

            Auth.login({
                userId: vm.userId,
                password: vm.password,
                authNumber: vm.authNumber,
                rememberMe: vm.rememberMe
            }).then(function () {
                window.localStorage.setItem('loginStatus', 'success');
                vm.authenticationError = false;

                $rootScope.$broadcast('authenticationSuccess');

                // previousState was set in the authExpiredInterceptor before being redirected to login modal.
                // since login is succesful, go to stored previousState and clear previousState
                if (Auth.getPreviousState()) {
                    var previousState = Auth.getPreviousState();
                    Auth.resetPreviousState();
                    if (previousState.name == 'register' || previousState.name == 'requestReset' || previousState.name == 'login') $state.go('home');
                    else $state.go(previousState.name, previousState.params);
                }else $state.go('home');
            }).catch(function (error) {
                vm.authNumber = '';
                vm.authenticationError = true;
                vm.isSecondAuthRequested = false;
                if (error.data.message && error.data.message == 'User withdrawing') {
                    vm.authenticationErrorMessage = 'login.messages.error.withdrawing';
                } else if (error.data.message && error.data.message == 'User registering') {
                    vm.authenticationErrorMessage = 'login.messages.error.registering';
                } else {
                    vm.authenticationErrorMessage = 'login.messages.error.authentication';
                    vm.authenticationErrorMessage = error.data.message;
                }
            });
        }

        function register() {
            //$uibModalInstance.dismiss('cancel');
            $state.go('register');
        }

        function requestResetPassword() {
            //$uibModalInstance.dismiss('cancel');
            $state.go('requestReset');
        }

        function secondCheck() {
            vm.msecPerMinute = 3000 * 60;
            vm.msecPerSecond = 1000;
            var interval = $interval(function () {
                vm.msecPerMinute = vm.msecPerMinute - vm.msecPerSecond;
                if (vm.msecPerMinute <= 0) {
                    vm.isSecondAuthRequested = false;
                    $interval.cancel(interval);
                }
                if (vm.authenticationError) $interval.cancel(interval);
                $rootScope.$on('$stateChangeSuccess', function(){$interval.cancel(interval);});
            }, 1000);
        }
    }
})();
