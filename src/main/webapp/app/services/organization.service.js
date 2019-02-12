(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Organization', Organization);

    Organization.$inject = ['$resource'];

    function Organization($resource) {
        return $resource('/api/organizations', {}, {
            'query': {method: 'GET', isArray: true},
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'delete': {
                url: '/api/organizations/:id',
                method: 'DELETE',
                id: '@id'
            },
            'getAccountNumber': {
                url: '/api/organizations/account-number',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                transformRequest: function (data) {
                    return $.param(data);
                }
            },
            'setDefaultWithdrawalAccount': {
                url: '/api/organizations/:withdrawalId/default-account',
                method: 'PUT',
                params: {
                    orgId: '@orgId',
                    withdrawalId: '@withdrawalId'
                }
            },
            'checkWithdrawalAccountUsed': {
                url: '/api/organizations/check-account-used',
                method: 'GET',
                params: {
                    withdrawalId: '@withdrawalId'
                }
            },
            'deleteLatestHistory': {
                url: '/api/organizations/delete-latest-history',
                method: 'DELETE'
            },
            // 현재 로그인 사용자의 기관정보
            'current': {
                url: '/api/organizations/current',
                method: 'GET'
            },
            'users': {
                url: '/api/organizations/:id/users',
                method: 'GET',
                id: '@id',
                isArray: true
            },
            'apis': {
                url: '/api/organizations/:id/apis',
                method: 'GET',
                isArray: true,
                id: '@id'
            },
            'forums': {
                url: '/api/organizations/:id/forums',
                method: 'GET',
                isArray: true,
                id: '@id'
            },
            'providersForums': {
                url: '/api/organizations/providers/forums',
                method: 'GET',
                isArray: true
            },
            'availableForums': {
                url: '/api/organizations/forums',
                method: 'GET',
                isArray: true
            },
            'providers': {
                url: '/api/organizations/providers',
                method: 'GET',
                isArray: true
            },
            'partners': {
                url: '/api/organizations/partners',
                method: 'GET',
                isArray: true
            },
            'search': {
                url: '/api/organizations/search',
                method: 'GET',
                isArray: true
            },
            'searchOrganization': {
                url: '/api/organizations/searchOrganization',
                method: 'GET'
            },
            'updateOrganization': {
                url: '/api/organizations/update',
                method: 'PUT'
            },
            'reqApproval':{
                url:'/api/organizations/:id/approval',
                method: 'POST',
                params:{
                    id : '@id'
                }
            },
            'changeSet':{
                url:'/api/organizations/:id/changeset',
                method: 'GET',
                params:{
                    id : '@id'
                }
            },
            'searchForAdmin': {
                url: '/api/admin/organizations/search',
                method: 'GET',
                isArray: true,
                params: {
                    type: '@type'
                }
            },
            'usersForAdmin': {
                url: '/api/admin/organizations/:orgId/users',
                method: 'GET',
                orgId: '@orgId',
                isArray: true
            },
            'createForAdmin': {
                url: '/api/admin/organizations',
                method: 'POST'
            },
            'updateForAdmin': {
                url: '/api/admin/organizations/update',
                method: 'PUT'
            },
            'deleteForAdmin': {
                url: '/api/admin/organizations/:orgId',
                method: 'DELETE',
                params: {
                    orgId: '@orgId'
                }
            },
            'setManagerForAdmin': {
                url: '/api/admin/organizations/:orgId/users/:userId/setmanager',
                method: 'GET',
                isArray: true,
                params: {
                    orgId: '@orgId',
                    userId: '@userId'
                }
            },
            'listByTypeForAdmin': {
                url: '/api/admin/organizations',
                method: 'GET',
                isArray: true,
                params: {
                    type: '@type'
                }
            },
            'activateForAdmin': {
                url: '/api/admin/organizations/:orgId/:mode',
                method: 'GET',
                params: {
                    orgId: '@orgId',
                    mode: '@mode'
                }
            }
        });
    }
})();
