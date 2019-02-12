(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig)

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig ($stateProvider) {
        $stateProvider.state('notice', {
            url: '/notice:id',
            data: {
                authorities: [],
                pageTitle: 'global.notice'
            },
            views: {
                'mainContainer@': {
                    templateUrl: 'app/layouts/notice/notice.html',
                    controller: 'NoticeController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('global');
                    return $translate.refresh();
                }]
            }
        });
    }

})();