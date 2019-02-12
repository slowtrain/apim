(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Apps', Apps);

    Apps.$inject = ['$resource'];

    function Apps ($resource) {
        var service = $resource('/api/apps', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'apiList': {
                url:'/api/apps/apis',
                method: 'GET',
                isArray: true,
                params:{
                    orgId : '@orgId',
                    apiName : '@apiName'
                }
            },
            'apigroups': {
                url:'/api/apps/apigroups',
                method: 'GET',
                isArray: true,
                params:{
                    orgId : '@orgId',
                    apiGroupName : '@apiGroupName'
                }
            },
            'create':{
                method:'POST'
            },
            'search':{
                url:'/api/apps/:id',
                method: 'GET',
                params:{
                    id : '@id'
                }
            },
            'update':{
                method: 'PUT'
            },
            'delete':{
                url:'/api/apps/:id',
                method: 'DELETE',
                params:{
                    id : '@id'
                }
            },
            'deleteLatestHistory': {
                url: '/api/apps/:id/delete-latest-history',
                method: 'DELETE',
                id: '@id'
            },
            'register':{
                url:'/api/apps/:id/register',
                method: 'GET',
                params:{
                    id : '@id'
                }
            },
            'unRegister':{
                url:'/api/apps/:id/unregister',
                method: 'GET',
                params:{
                    id : '@id'
                }
            },
            'genkey':{
                url:'/api/apps/:id/genkey',
                method: 'GET',
                params:{
                    id : '@id'
                }
            },
            'getSecret':{
                url:'/api/apps/:id/secret',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                params:{
                    id : '@id'
                },
                transformRequest: function (data) {
                    return $.param(data);
                }
            },
            'regenSecret':{
                url:'/api/apps/:id/regen-secret',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                params:{
                    id : '@id'
                },
                transformRequest: function (data) {
                    return $.param(data);
                }
            },
            'reqApproval':{
                url:'/api/apps/:id/approval',
                method: 'POST',
                params:{
                    id : '@id'
                }
            },
            'myList':{
                url:'/api/apps/mine',
                method: 'GET',
                isArray: true,
                params: {
                    page: '@page',
                    size: '@size'
                }
            },
            'orgList':{
                url:'/api/apps',
                method: 'GET',
                isArray: true,
                params: {
                    page: '@page',
                    size: '@size'
                }
            },
            'changeStatus': {
                url: '/api/apps/:appId/:toStatus',
                method: 'GET',
                params: {
                    appId: '@appId',
                    toStatus: '@toStatus'
                }
            },
            'changeSet':{
                url:'/api/apps/:id/changeset',
                method: 'GET',
                params:{
                    id : '@id'
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
        return service;
    }
})();
