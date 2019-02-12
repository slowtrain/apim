(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Discount', Discount);

    Discount.$inject = ['$resource'];

    function Discount ($resource) {
        var service = $resource('/api/organizations/:orgId/discountpolicies', null, {
            'list': {
        		method: 'GET',
        		isArray: true,
                params:{
                    orgId:'@orgId'
                }
        	},
        	'create':{
                method:'POST',
                params:{
                    orgId:'@orgId'
                }
            },
            'update':{
                url:'/api/organizations/:orgId/discountpolicies/:policyId',
                method: 'PUT',
                params:{
                    orgId:'@orgId',
                    policyId:'@policyId'
                }
            },
            'delete':{
                url:'/api/organizations/:orgId/discountpolicies/:policyId',
                method: 'DELETE',
                params:{
                    orgId:'@orgId',
                    policyId:'@policyId'
                }
            }
        });
        return service;
    }
})();
