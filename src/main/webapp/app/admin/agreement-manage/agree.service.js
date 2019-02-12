(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('AgreeManagement', AgreeManagement);

    AgreeManagement.$inject = ['$resource'];

    function AgreeManagement($resource) {
        return $resource('/api/admin/agrees', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'addAgree': {
                method: 'POST'
            },
            'editAgree': {
                url: '/api/admin/agrees/:id',
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
            'delAgree': {
                url: '/api/admin/agrees/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            'setUse': {
                url: '/api/admin/agrees/:id/settinguse',
                method: 'PUT',
                params: {
                    id: '@id'
                }
            }
        });
    }
})();
