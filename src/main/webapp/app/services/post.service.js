(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Post', Post);

    Post.$inject = ['$resource'];

    function Post ($resource) {
        var service = $resource('/api/forums/:forumId/posts', null, {
            'list': {
                method: 'GET',
                isArray: true,
                params:{
                    forumId : '@forumId',
                    page: '@page',
                    size: '@size',
                    postTitle: '@postTitle',
                    writerName: '@writerName',
                    targetOrganizationId: '@targetOrganizationId'
                }
            },
            'create':{
                method:'POST',
                params:{
                    forumId : '@forumId'
                }
            },
            'update':{
                url:'/api/forums/:forumId/posts/:postId',
                method: 'PUT',
                params:{
                    forumId : '@forumId',
                    postId : '@postId'
                }
            },
            'move':{
                url:'/api/forums/:forumId/posts/:postId/move',
                method: 'GET',
                params:{
                    forumId : '@forumId',
                    postId : '@postId'
                }
            },
            'detail':{
                url:'/api/forums/:forumId/posts/:postId',
                method: 'GET',
                params:{
                    forumId : '@forumId',
                    postId : '@postId'
                }
            },
            'delete':{
                url:'/api/forums/:forumId/posts/:postId',
                method: 'DELETE',
                params:{
                    forumId : '@forumId',
                    postId : '@postId'
                }
            },
            'commentW':{
                url:'/api/forums/:forumId/posts/:postId/reply',
                method: 'POST',
                params:{
                    forumId : '@forumId',
                    postId : '@postId'
                }
            },
            'postCategories':{
                url:'/api/apigroups/post-categories',
                method: 'GET',
                isArray: true,
                params:{
                    orgId : '@orgId'
                }
            }
        });
        return service;
    }
})();
