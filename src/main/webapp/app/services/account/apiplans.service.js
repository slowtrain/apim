(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('apiPlans', apiPlans);

    apiPlans.$inject = ['$resource'];

    function apiPlans($resource) {
        var service = $resource('/api/apiplans', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'save': {
                method: 'POST'
            },
            'update': {
                method: 'PUT'
            },
            'delete': {
                url: '/api/apiplans/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            'available': {
                url: '/api/apiplans/available',
                method: 'GET',
                isArray: true
            }
        });
        return service;
    }
})();
