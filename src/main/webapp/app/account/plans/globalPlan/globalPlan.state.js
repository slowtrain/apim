(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('globalPlan', {
                parent: 'plans',
                url: '/globalPlan',
                data: {
                    authorities: ['ROLE_PLAN_VIEW'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/account/plans/globalPlan/globalPlan.html',
                        controller: 'GlobalPlanController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('plan');
                        $translatePartialLoader.addPart('approval');
                        return $translate.refresh();
                    }]
                }
            });
    }
})();