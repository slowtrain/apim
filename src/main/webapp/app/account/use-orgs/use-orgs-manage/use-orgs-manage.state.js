(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('useOrgsManage', {
            parent: 'useOrgs',
            url: '/useOrgsManage',
            data: {
                authorities: ['ROLE_PLAN_VIEW'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/use-orgs/use-orgs-manage/use-orgs-manage.html',
                    controller: 'UseOrgsManageController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('use-orgs');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
