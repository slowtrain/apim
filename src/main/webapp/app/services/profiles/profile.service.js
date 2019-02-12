(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('ProfileService', ProfileService);

    ProfileService.$inject = ['$http'];

    function ProfileService($http) {
        var dataPromise;

        return {
            getProfileInfo: getProfileInfo
        };

        function getProfileInfo() {
            if (angular.isUndefined(dataPromise)) {
                dataPromise = $http.get('api/profile-info').then(function (result) {
                    if (result.data.activeProfiles) {
                        var response = {};
                        response.activeProfiles = result.data.activeProfiles;
                        response.ribbonEnv = result.data.ribbonEnv;

                        // 운영 장비
                        response.inProduction = result.data.activeProfiles.indexOf("prod") !== -1;
                        // 테스트 장비
                        response.inTest = result.data.activeProfiles.indexOf("test") !== -1;
                        // 개발 환경
                        response.inDev = result.data.activeProfiles.indexOf("dev") !== -1;

                        response.swaggerEnabled = result.data.activeProfiles.indexOf("swagger") !== -1;
                        response.emailEnabled = result.data.emailEnabled;
                        response.loginSecondaryAuth = result.data.loginSecondaryAuth;
                        return response;
                    }
                });
            }
            return dataPromise;
        }
    }
})();
