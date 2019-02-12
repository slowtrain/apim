(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin-apis', {
            parent: 'admin',
            url: '/admin/apis?size&page&totalLength',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/apis/admin-apis.html',
                    controller: 'AdminApiManagementController',
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
                    $translatePartialLoader.addPart('api');
                    $translatePartialLoader.addPart('app-management');
                    $translatePartialLoader.addPart('billing');
                    return $translate.refresh();
                }]

            }
        });
    }
})();
