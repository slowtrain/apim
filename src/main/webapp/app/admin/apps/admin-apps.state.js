(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin-apps', {
            parent: 'admin',
            url: '/admin/apps?size&page&totalLength',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/apps/admin-apps.html',
                    controller: 'AdminAppManagementController',
                    controllerAs: 'vm'
                }
            },
            params: {
                size: {
                    value: '10',
                    squash: true
                },
                page: {
                    value: '0',
                    squash: true
                },
                sort: {
                    value: 'id,desc',
                    squash: true
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('app-management');
                    return $translate.refresh();
                }]

            }
        });
    }
})();
