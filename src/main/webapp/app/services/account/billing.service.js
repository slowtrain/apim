(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Billing', Billing);

    Billing.$inject = ['$resource'];

    function Billing ($resource) {
        var service = $resource('/api/organizations/', null, {
            'list': {
                url:'/api/organizations/:id/billingpolicies',
        		method: 'GET',
        		isArray: true,
                params:{
                    orgId:'@id'
                }
        	},
        	'create':{
                url:'/api/organizations/:id/billingpolicies',
                method:'POST',
                params:{
                    orgId:'@id'
                }
            },
            'update':{
                url:'/api/organizations/:orgId/billingpolicies/:id',
                method: 'PUT',
                params:{
                    id : '@id',
                    orgId:'@orgId'
                }
            },
            'delete':{
                url:'/api/organizations/:orgId/billingpolicies/:id',
                method: 'DELETE',
                params:{
                    id : '@id',
                    orgId:'@orgId'
                }
            },
            'showDetail':{
                url:'/api/organizations/:orgId/billingpolicies/:id',
                method: 'GET',
                params:{
                    id : '@id',
                    orgId:'@orgId'
                }
            }
        });
        return service;
    }
})();
