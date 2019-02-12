(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin-gatewayclusters', {
            parent: 'admin',
            url: '/admin/gatewayclusters',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/gatewayclusters/admin-gatewayclusters.html',
                    controller: 'GatewayClusterController',
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
