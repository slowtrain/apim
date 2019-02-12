(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('report-token', {
            parent: 'reports',
            url: '/account/reports/token',
            data: {
                // authorities: ['ROLE_ADMIN']
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/reports/token/report-token.html',
                    controller: 'ReportTokenController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('admin-billing');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
