(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('RoleAuth', RoleAuth);

    RoleAuth.$inject = ['$resource'];

    function RoleAuth($resource) {
        return $resource('/api/authorities', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'listKind': {
                url: '/api/authorities/kinds',
                method: 'GET',
                isArray: true
            }
        });
    }
})();
