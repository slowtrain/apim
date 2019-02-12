(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('report-api-using', {
            parent: 'reports',
            url: '/account/reports/api-using',
            data: {
                authorities: ['ROLE_REPORT_VIEW_API']
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/reports/api/report-api-using.html',
                    controller: 'ReportApiUsingController',
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
