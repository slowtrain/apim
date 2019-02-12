(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin-agreement-manage', {
            parent: 'admin',
            url: '/admin/agreement-manage?size&page',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/agreement-manage/admin-agreement-manage.html',
                    controller: 'AgreeManagementController',
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
                    $translatePartialLoader.addPart('agree');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
