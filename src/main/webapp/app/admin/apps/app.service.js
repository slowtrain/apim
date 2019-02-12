(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('AdminAppService', AdminAppService);

    AdminAppService.$inject = ['$resource'];

    function AdminAppService($resource) {
        return $resource('/api/admin/apps', null, {
            'list': {
                method: 'GET',
                isArray: true,
                params: {
                    page: '@page',
                    size: '@size'
                }
            },
            'apiList': {
                url: '/api/apps/apis',
                method: 'GET',
                isArray: true
            },
            'delete': {
                url: '/api/admin/apps/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            'redeploy':{
                url:'/api/apps/:id/redeploy',
                method: 'POST',
                params:{
                    id : '@id'
                }
            },
            'deployFailList':{
                url:'/api/apps/:id/redeploy',
                method: 'GET',
                isArray: true,
                params:{
                    id : '@id'
                }
            }
        });
    }
})();
