(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Agree', Agree);

    Agree.$inject = ['$resource'];

    function Agree ($resource) {
        var service = $resource('/api/agrees', null, {
            'list': {
        		method: 'GET',
        		isArray: true
        	},
            'addAgree': {
                method: 'POST'
            },
            'editAgree': {
                url: '/api/agrees/:id',
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
            'delAgree': {
                url: '/api/agrees/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            'setUse': {
                url: '/api/agrees/:id/settinguse',
                method: 'PUT',
                params: {
                    id: '@id'
                }
            }
        });
        return service;
    }
})();
