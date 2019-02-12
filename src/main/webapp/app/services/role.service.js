(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Role', Role);

    Role.$inject = ['$resource'];

    function Role($resource) {
        return $resource('/api/roles', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'create': {
                method: 'POST'
            },
            'update': {
                method: 'PUT'
            },
            'delete': {
                url: '/api/roles/:roleId',
                method: 'DELETE',
                params: {
                    roleId: '@roleId'
                }
            },
            'roleAuth': {
                url: '/api/roles/:roleCode/authorities',
                method: 'GET',
                isArray: true,
                params: {
                    roleCode: '@roleCode'
                }
            },
            'listKind': {
                url: '/api/authorities/kinds',
                method: 'GET',
                isArray: true
            },
            'listAuth': {
                url: '/api/authorities',
                method: 'GET',
                isArray: true
            }
        });
    }
})();
