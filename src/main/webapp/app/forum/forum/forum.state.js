(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('forumCommunity', {
            parent: 'forum',
            url: '/forum-community',
            data: {
            	//authorities: [],
                pageTitle: 'global.title'
            },
            views: {
                // 'lnbBack@': {
                //     templateUrl: 'app/layouts/lnb-back/lnb-back.html'
                // },
                'contentAll@': {
                    templateUrl: 'app/forum/forum/forum.html',
                    controller: 'ForumController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('forum');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
