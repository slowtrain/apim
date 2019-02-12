(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin-users', {
            parent: 'admin',
            url: '/admin/users?page&sort',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/users/admin-users.html',
                    controller: 'AdminUserController',
                    controllerAs: 'vm'
                }
            },
            params: {
                page: {
                    value: '1',
                    squash: true
                },
                size: {
                    value: '10',
                    squash: true
                },
                sort: {
                    value: 'id,desc',
                    squash: true
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('user-management');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
