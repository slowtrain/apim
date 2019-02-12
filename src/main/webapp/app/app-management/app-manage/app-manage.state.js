(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('appManage', {
                parent: 'appManagement',
                url: '/apps/organization?size&page&sort',
                data: {
                    authorities: ['ROLE_APP_VIEW'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/app-management/app-manage/app-manage.html',
                        controller: 'AppManageController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    size : {
                        value: '10',
                        squash: true
                    },
                    page : {
                        value: '0',
                        squash: true
                    },
                    sort : {
                        value: 'id,desc',
                        squash: true
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('app-management');
                        $translatePartialLoader.addPart('approval');
                        $translatePartialLoader.addPart('api');
                        return $translate.refresh();
                    }]
                }
            })
            .state('appMine', {
                parent: 'appManagement',
                url: '/apps/mine?size&page&sort',
                data: {
                    authorities: ['ROLE_APP_VIEW'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/app-management/app-manage/app-manage.html',
                        controller: 'AppManageController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    size : {
                        value: '10',
                        squash: true
                    },
                    page : {
                        value: '0',
                        squash: true
                    },
                    sort : {
                        value: 'id,desc',
                        squash: true
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('app-management');
                        $translatePartialLoader.addPart('approval');
                        $translatePartialLoader.addPart('api');
                        return $translate.refresh();
                    }]
                }
            })
            .state('appOrg', {
                parent: 'appManagement',
                url: '/app-org',
                data: {
                    authorities: ['ROLE_APP_CREATE'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/app-management/app-manage/app-manage.html',
                        controller: 'AppManageController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('app-management');
                        $translatePartialLoader.addPart('approval');
                        $translatePartialLoader.addPart('api');
                        return $translate.refresh();
                    }]
                }
            });
    }
})();
