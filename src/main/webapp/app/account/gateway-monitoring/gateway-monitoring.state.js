(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('gateway-monitor', {
            abstract: true,
            parent: 'account',
            data:{
                depth:[1,2,3]
            }
        }).state('gateway-monitoring', {
            parent: 'gateway-monitor',
            url: '/gateway-monitoring',
            data: {
                authorities: ['ROLE_PLAN_VIEW'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/gateway-monitoring/gateway-monitoring.html',
                    controller: 'GatewayMonitoringController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('gateway');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
