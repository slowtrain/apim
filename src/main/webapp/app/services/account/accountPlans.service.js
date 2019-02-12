(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('accountPlans', accountPlans);

    accountPlans.$inject = ['$resource'];

    function accountPlans($resource) {
        return $resource('api/accountplans', null, {
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
                url: '/api/accountplans/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            }
        });
    }
})();
