(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('report-api-providing', {
            parent: 'reports',
            url: '/account/reports/api-providing',
            data: {
                authorities: ['ROLE_REPORT_VIEW_API']
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/reports/api/report-api-providing.html',
                    controller: 'ReportApiProvidingController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('report');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
