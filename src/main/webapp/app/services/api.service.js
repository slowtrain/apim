(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Api', Api);

    Api.$inject = ['$resource'];

    function Api($resource) {
        var service = $resource('/api/apis', null, {
            'form': {
                url: '/api/apis/form',
                method: 'GET',
                isArray: false
            },
            'list': {
                method: 'GET',
                isArray: true
            },
            'listApproved': {
                url: '/api/apis/approved',
                method: 'GET',
                isArray: true
            },
            'create': {
                method: 'POST'
            },
            'update': {
                method: 'PUT',
                params: {
                    fragmentDiffer: '@fragmentDiffer'
                }
            },
            'delete': {
                url: '/api/apis/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            'redeploy': {
                url: '/api/apis/:apiId/redeploy',
                method: 'POST',
                params: {
                    apiId: '@apiId'
                }
            },
            'unuse': {
                url: '/api/apis/:apiId/unuse',
                method: 'GET',
                params: {
                    apiId: '@apiId'
                }
            },
            'getAttachFiles': {
                url: '/api/apis/:apiId/attachfiles',
                method: 'GET',
                params: {
                    apiId: '@apiId'
                }
            },
            'reqApproval': {
                url: '/api/apis/:id/approval',
                method: 'POST',
                params: {
                    id: '@id'
                }
            },
            'listTerms': {
                url: '/api/terms',
                method: 'GET',
                isArray: true,
                params: {
                    page: '@page',
                    size: '@size'
                }
            },
            'addTerms': {
                url: '/api/terms',
                method: 'POST'
            },
            'editTerms': {
                url: '/api/terms/:id',
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
            'delTerms': {
                url: '/api/terms/:id',
                method: 'DELETE',
                params: {
                    id: '@id'
                }
            },
            'usedAppList': {
                url: '/api/apis/:id/apps',
                method: 'GET',
                isArray: true,
                params: {
                    id: '@id'
                }
            },
            'usedAppListForAdmin': {
                url: '/api/admin/apis/:id/apps',
                method: 'GET',
                isArray: true,
                params: {
                    id: '@id'
                }
            },
            'termsByOrganization': {
                url: '/api/organizations/:id/terms',
                method: 'GET',
                isArray: true,
                params: {
                    id: '@id'
                }
            },
            'getTermsContent': {
                url: '/api/terms/:id',
                method: 'GET',
                params: {
                    id: '@id'
                }
            },
            'billingPolicy': {
                url: '/api/organizations/:id/billingpolicies',
                method: 'GET',
                isArray: true,
                params: {
                    id: '@id'
                }
            },
            'organization': {
                url: '/api/organizations/current',
                method: 'GET'
            },
            'apiById': {
                url: '/api/apis/:id',
                method: 'GET',
                params: {
                    id: '@id'
                }
            },
            'apiByIdForPartner': {
                url: '/api/partner/apis/:id',
                method: 'GET',
                params: {
                    id: '@id'
                }
            },
            'getForumsByApi': {
                url: '/api/apis/:id/forums',
                method: 'GET',
                isArray: true,
                params: {
                    id: '@id'
                }
            },
            'checkname': {
                url: '/api/apis/checkname',
                method: 'GET',
                params: {
                    apiId: '@apiId',
                    name: '@name'
                }
            },
            'checkuri': {
                url: '/api/apis/checkuri',
                method: 'GET',
                params: {
                    apiId: '@apiId',
                    name: '@name'
                }
            },
            'changeStatus': {
                url: '/api/apis/:apiId/:toStatus',
                method: 'GET',
                params: {
                    apiId: '@apiId',
                    toStatus: '@toStatus'
                }
            },
            'groups': {
                url: '/api/apis/:apiId/groups',
                method: 'GET',
                isArray: true,
                params: {
                    apiId: '@apiId'
                }
            },
            'apisForPartners': {
                url: '/api/partner/organizations/:orgId/apis',
                method: 'GET',
                isArray: true,
                params: {
                    orgId: '@orgId'
                }
            },

        });
        return service;
    }
})();
