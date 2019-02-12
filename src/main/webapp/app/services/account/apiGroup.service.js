(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('ApiGroup', ApiGroup);

    ApiGroup.$inject = ['$resource'];

    function ApiGroup ($resource) {
        var service = $resource('/api/apigroups', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'listForPartner': {
                method: 'GET',
                isArray: true,
                url: '/api/apigroups/for-partner',
                param: {
                    orgId : '@orgId',
                    isPrivate : '@isPrivate'
                }
            },
            'listForPartnerPageable': {
                method: 'GET',
                isArray: true,
                url: '/api/apigroups/for-partner/pageable',
                param: {
                    orgId : '@orgId',
                    apiGroupName : '@apiGroupName'
                }
            },
            'listForAdmin': {
                method: 'GET',
                isArray: true,
                url: '/api/admin/apigroups',
                param: {
                    orgId : '@orgId'
                }
            },
            'create':{
                method:'POST'
            },
            'update':{
                url:'/api/apigroups/:id',
                method: 'PUT',
                params:{
                    id : '@id'
                }
            },
            'delete':{
                url:'/api/apigroups/:id',
                method: 'DELETE',
                params:{
                    id : '@id'
                }
            },
            'listByApi': {
                url:'/api/apigroups/:id',
                method: 'GET',
                isArray: true,
                params: {
                    id : '@id',
                    page: '@page',
                    size: '@size'
                }
            }
        });
        return service;
    }
})();
