(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('report-billing-providing', {
            parent: 'reports',
            url: '/account/reports/billing-providing',
            data: {
                authorities: ['ROLE_REPORT_VIEW_API']
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/reports/billing-providing/report-billing-providing.html',
                    controller: 'ReportBillingProvidingController',
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
