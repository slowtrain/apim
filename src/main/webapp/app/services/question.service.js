(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Question', Question);

    Question.$inject = ['$resource'];

    function Question ($resource) {
        var service = $resource('/api/forums/questions', null, {
            'list': {
                method: 'GET',
                isArray: true,
                params:{
                    forumId : '@forumId',
                    page: '@page',
                    size: '@size',
                    title: '@title',
                    writerName: '@writerName'
                }
            },
            'create':{
                method:'POST'
            },
            'password':{
                url:'/api/forums/questions/:questionId/password',
                method: 'GET',
                params:{
                    questionId : '@questionId'
                }
            },
            'detail':{
                url:'/api/forums/questions/:questionId',
                method: 'GET',
                params:{
                    questionId : '@questionId'
                }
            },
            'createReply':{
                url:'/api/forums/questions/:questionId/reply',
                method:'POST',
                params:{
                    questionId : '@questionId'
                }
            },
            /*'update':{
                url:'/api/forums/questions/:questionId',
                method: 'PUT',
                params:{
                    questionId : '@questionId'
                }
            },*/
            'delete':{
                url:'/api/forums/questions/:questionId/delete',
                method: 'DELETE',
                params:{
                    questionId : '@questionId'
                }
            }
        });
        return service;
    }
})();
