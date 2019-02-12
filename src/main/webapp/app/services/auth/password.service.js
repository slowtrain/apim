(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Password', Password);

    Password.$inject = ['$resource'];

    function Password($resource) {
        var service = $resource('api/account/change_password', {}, {
            'save': {
                method: 'POST',
                params: {
                    currentPassword: '@currentPassword',
                    newPassword: '@newPassword'
                }
            }
        });
        return service;
    }
})();
