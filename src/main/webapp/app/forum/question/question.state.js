(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('question', {
            parent: 'forumCommunity',
            data: {
                // authorities: ['ROLE_HASLOGIN'],
                pageTitle: 'global.title'
            },
            views: {
                'forumView@forumCommunity': {
                    templateUrl: 'app/forum/question/question.html',
                    controller: 'QuestionController',
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
                    $translatePartialLoader.addPart('question');
                    return $translate.refresh();
                }]
            }
        }).state('question.new', {
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
                    templateUrl: 'app/forum/question/question-new.html',
                    controller: 'QuestionNewController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('question');
                    return $translate.refresh();
                }]
            }
        }).state('question.detail', {
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
                    templateUrl: 'app/forum/question/question-detail.html',
                    controller: 'QuestionDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('question');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
