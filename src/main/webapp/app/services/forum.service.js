(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Forum', Forum);

    Forum.$inject = ['$resource'];

    function Forum ($resource) {
        var service = $resource('/api/forums', null, {
            'list': {
                method: 'GET',
                isArray: true
            },
            'create':{
                method:'POST'
            },
            'update':{
                method: 'PUT'
            },
            'delete':{
                url:'/api/forums/:id',
                method: 'DELETE',
                params:{
                    id : '@id'
                }
            },
            'viewAll':{
                url:'/api/forums/posts',
                method: 'GET',
                isArray: true,
                params:{
                    page: '@page',
                    size: '@size',
                    postTitle: '@postTitle',
                    writerName: '@writerName',
                    forumId: '@forumId'
                }
            },
            'listOrgs': {
                url:'/api/forums/organizations',
                method: 'GET',
                isArray: true
            },
            'listPublic': {
                url:'/api/forums/public',
                method: 'GET',
                isArray: true
            },
            'findId': {
                url:'/api/forums/find-id',
                method: 'GET',
                params:{
                    orgName : '@orgName',
                    forumTitle : '@forumTitle'
                }
            }
        });
        return service;
    }
})();
