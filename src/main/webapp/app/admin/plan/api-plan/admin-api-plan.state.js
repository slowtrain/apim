(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin-api-plan', {
                parent: 'admin-plan',
                url: '/admin/api-plan',
                data: {
                    authorities: ['ROLE_ADMIN'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/admin/plan/api-plan/admin-api-plan.html',
                        controller: 'AdminApiPlanController',
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
