(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Approval', Approval);

    Approval.$inject = ['$resource'];

    function Approval ($resource) {
        var service = $resource('/api/approvals', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'approve':{
                url:'/api/approvals/:id/approve',
                method:'PUT',
                params: {
                    id: '@id'
                }
            },
            'deny':{
                url:'/api/approvals/:id/deny',
                method: 'PUT',
                params: {
                    id: '@id'
                }
            },
            'cancel':{
                url:'/api/approvals/:id/cancel',
                method:'PUT'
            },
            'mine':{
                url:'/api/approvals/mine',
                method:'GET',
                isArray: true
            },
            'getComment':{
                url:'/api/approvals/:id/comments',
                method:'GET',
                isArray: true,
                params: {
                    id: '@id'
                }
            },
            'addComment':{
                url:'/api/approvals/:id/comments',
                method:'POST',
                params: {
                    id: '@id'
                }
            },
            'updateComment':{
                url:'/api/approvals/:id/comments',
                method:'PUT',
                params: {
                    id: '@id'
                }
            },
            'deleteComment':{
                url:'/api/approvals/:id/comments/:commentId',
                method:'DELETE',
                params: {
                    id: '@id',
                    commentId:'@commentId'
                }
            },
            'historyList':{
                url:'/api/approvals/history',
                method:'GET',
                isArray: true,
                params: {
                    page: '@page',
                    size: '@size'
                }
            },
            'delegate':{
                url:'/api/approvals/:id/delegate',
                method:'GET'
            },
            'progress':{
                url:'/api/approvals/:id/progress',
                method:'GET',
                isArray: true,
                params: {
                    id: '@id',
                    commentId:'@commentId'
                }
            }
        });
        return service;
    }
})();
