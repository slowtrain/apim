(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Scopes', Scopes);

    Scopes.$inject = ['$resource'];

    function Scopes($resource) {
        return $resource('api/admin/scopes', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'create': {
                method: 'POST'
            },
            'update': {
                url: '/api/admin/scopes/:id',
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
            'delete': {
                url: '/api/admin/scopes/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            }
        });
    }
})();
