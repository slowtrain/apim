(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('post', {
            parent: 'forumCommunity',
            data: {
                // authorities: ['ROLE_HASLOGIN'],
                pageTitle: 'global.title'
            },
            views: {
                'forumView@forumCommunity': {
                    templateUrl: 'app/forum/post/post.html',
                    controller: 'PostController',
                    controllerAs: 'vm'
                }
            },
            params: {
                isWritable: '@isWritable',
                forumTitle: '@forumTitle',
                forumId: '@forumId',
                forumOwner: '@forumOwner',
                sort: {
                    value: 'id,desc',
                    squash: true
                },
                size: {
                    value: '10',
                    squash: true
                },
                page: {
                    value: '0',
                    squash: true
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('post');
                    return $translate.refresh();
                }]
            }
        }).state('post.new', {
            parent: 'forumCommunity',
            data: {
                //authorities: ['ROLE_HASLOGIN'],
                pageTitle: 'global.title'
            },
            params: {
                isWritable: '@isWritable',
                forumTitle: '@forumTitle',
                forumId: '@forumId'
            },
            views: {
                'forumView@forumCommunity': {
                    templateUrl: 'app/forum/post/post-new.html',
                    controller: 'PostNewController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('post');
                    return $translate.refresh();
                }]
            }
        }).state('post.detail', {
            parent: 'forumCommunity',
            data: {
                //authorities: ['ROLE_HASLOGIN'],
                pageTitle: 'global.title'
            },
            params: {
                isWritable: '@isWritable',
                forumTitle: '@forumTitle',
                forumId: '@forumId'
            },
            views: {
                'forumView@forumCommunity': {
                    templateUrl: 'app/forum/post/post-detail.html',
                    controller: 'PostDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('post');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
