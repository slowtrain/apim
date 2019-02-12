(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('contents-provider', {
            abstract: true,
            parent: 'account',
            data: {
                authorities: ['ROLE_PLAN_VIEW'],
                depth: [1, 2, 3]
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/contents-provider/contents-provider.html',
                    controller: 'ContentsProviderController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('api');
                    return $translate.refresh();
                }]
            }
        }).state('provider-service-package', {
            parent: 'contents-provider',
            url: '/contents-provider/service-package'
        });
    }
})();