(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('UseOrgs', UseOrgs);

    UseOrgs.$inject = ['$resource'];

    function UseOrgs ($resource) {
        var service = $resource('/api/organizations/:orgId/useorgs', null, {
            'list': {
                method: 'GET',
                isArray: true,
                params:{
                    orgId:'@orgId'
                }
            },
            'update':{
                url:'/api/organizations/:orgId/useorgs/:useorgId/discountpolicy/:policyId',
                method: 'GET',
                params:{
                    orgId:'@orgId',
                    useorgId:'@useorgId',
                    policyId:'@policyId'
                }
            },
            'findApps':{
                url:'/api/organizations/:orgId/useorgs/:useorgId/apps',
                method: 'GET',
                isArray: true,
                params:{
                    orgId:'@orgId',
                    useorgId:'@useorgId'
                }
            },
            'listComments':{
                url:'/api/organizations/:orgId/useorgs/:useorgId/comments',
                method: 'GET',
                isArray: true,
                params:{
                    orgId:'@orgId',
                    useorgId:'@useorgId'
                }
            },
            'createComment':{
                url:'/api/organizations/:orgId/useorgs/:useorgId/comments',
                method: 'POST',
                params:{
                    orgId:'@orgId',
                    useorgId:'@useorgId'
                }
            },
            'delComment':{
                url:'/api/organizations/:orgId/useorgs/:useorgId/comments/:commentId',
                method: 'DELETE',
                params:{
                    orgId:'@orgId',
                    useorgId:'@useorgId',
                    commentId:'@commentId'
                }
            }
        });
        return service;
    }
})();
