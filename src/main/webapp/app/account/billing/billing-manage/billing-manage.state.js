(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('billingManage', {
            parent: 'billing',
            url: '/billingManage',
            data: {
                authorities: ['ROLE_PLAN_VIEW'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/billing/billing-manage/billing-manage.html',
                    controller: 'billingManageController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('billing');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
