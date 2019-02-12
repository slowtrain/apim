(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('report-charging', {
            parent: 'reports',
            url: '/account/reports/charging',
            data: {
                authorities: ['ROLE_REPORT_VIEW_API']
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/reports/charging/report-charging.html',
                    controller: 'ReportChargingController',
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
