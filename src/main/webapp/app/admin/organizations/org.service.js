(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Org', Org);

    Org.$inject = ['$resource'];

    function Org ($resource) {
        var service = $resource('/api/organizations', {}, {
            'query': {method: 'GET', isArray: true},
            'save': { method:'POST' },
            'update': { method:'PUT' },
            'delete':{
                url:'/api/organizations/:id',
                method:'DELETE',
                id: '@id'
            },
            'users':{
                url:'/api/organizations/users',
                method: 'GET',
                isArray: true
            },
            'setManager':{
                url:'/api/organizations/:orgId/users/:userId/setmanager',
                method: 'GET',
                params: {
                    orgId: '@orgId',
                    userId: '@userId'
                }
            },
            'moveUser':{
                url:'/api/admin/users/:userId/move',
                method: 'GET',
                params: {
                    userId: '@userId',
                    organizationId: '@organizationId'
                }
            },
            'providers': {
                url: '/api/organizations/providers',
                method: 'GET',
                isArray: true
            },
            'forums':{
                url:'/api/organizations/forums',
                method: 'GET',
                isArray: true
            }
        });
        return service;
    }
})();
