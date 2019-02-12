(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('AdminApiService', AdminApiService);

    AdminApiService.$inject = ['$resource'];

    function AdminApiService($resource) {
        return $resource('/api/admin/apis', null, {
            'list': {
                method: 'GET',
                isArray: true,
                params: {
                    page: '@page',
                    size: '@size'
                }
            },
            'delete': {
                url: '/api/admin/apis/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            }
        });
    }
})();
