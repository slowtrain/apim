(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('admin-scope-management', {
                parent: 'admin',
                url: '/admin/scope-management',
                data: {
                    authorities: ['ROLE_ADMIN'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/admin/scope-management/admin-scope-management.html',
                        controller: 'ScopeManagementController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('scope');
                        return $translate.refresh();
                    }]
                }
            });
    }
})();
