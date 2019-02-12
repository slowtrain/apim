(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('ApprovalLine', ApprovalLine);

    ApprovalLine.$inject = ['$resource'];

    function ApprovalLine ($resource) {
        var service = $resource('/api/users', null, {
        	'findUsers': {
        		method: 'GET',
        		isArray: true
        	},
        	'create':{
                url:'/api/approvals/lines',
                method:'POST'
            },
            'list':{
                url:'/api/approvals/lines',
                method:'GET',
                isArray: true,
                params: {
                	page: '@page',
                	size: '@size'
                }
            },
            'update':{
                url:'/api/approvals/lines',
                method: 'PUT'
            },
            'delete':{
                url:'/api/approvals/lines/:id',
                method: 'DELETE',
                params:{
                	id : '@id'
                }
            },
            'forapp':{
                url:'/api/approvals/lines/:id/forapp',
                method: 'GET',
                params:{
                	id : '@id'
                }
            }
        });
        return service;
    }
})();
