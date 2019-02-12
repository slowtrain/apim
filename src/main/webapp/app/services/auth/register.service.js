(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Register', Register);

    Register.$inject = ['$resource'];

    function Register($resource) {
        return $resource('api/register', {}, {
            'save': {method: 'POST'},
            'saveWithOrg': {
                url: 'api/register_with_organization',
                method: 'POST'
            },
            'secondaryAuth':{
                url:'api/register/secondary_auth',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                transformRequest: function (data) {
                    return $.param(data);
                }
            },
            'secondaryAuthCheck':{
                url:'api/register/secondary_auth/check',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                transformRequest: function (data) {
                    return $.param(data);
                }
            }
        });
    }
})();
