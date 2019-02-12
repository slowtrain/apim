(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('AuthServerProvider', AuthServerProvider);

    AuthServerProvider.$inject = ['$http', '$localStorage'];

    function AuthServerProvider($http, $localStorage) {
        return {
            getToken: getToken,
            hasValidToken: hasValidToken,
            secondaryAuthenticateForLogin: secondaryAuthenticateForLogin,
            login: login,
            logout: logout
        };

        function getToken() {
            var token = $localStorage.authenticationToken;
            return token;
        }

        function hasValidToken() {
            var token = this.getToken();
            return !!token;
        }

        function login(credentials) {
            var data = 'user_id=' + encodeURIComponent(credentials.userId) +
                '&password=' + encodeURIComponent(credentials.password) +
                '&auth_number=' + credentials.authNumber +
                '&remember-me=' + credentials.rememberMe + '&submit=Login';

            return $http.post('api/authentication', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (response) {
                return response;
            });
        }

        function logout() {
            // logout from the server
            $http.post('api/logout').success(function (response) {
                delete $localStorage.authenticationToken;
                // to get a new csrf token call the api
                $http.get('api/account');
                return response;
            });

        }

        function secondaryAuthenticateForLogin(credentials) {
            var data = 'user_id=' + encodeURIComponent(credentials.userId) +
            '&password=' + encodeURIComponent(credentials.password);

            return $http.post('api/login/secondary_auth', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(function (response) {
                return response;
            });
        }
    }
})();
