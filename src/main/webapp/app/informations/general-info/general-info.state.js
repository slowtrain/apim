(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('portal-terms', {
            parent: 'app',
            url: '/portal-terms',
            views: {
                'content@': {
                    templateUrl: 'app/informations/general-info/general-info.html',
                    controller: 'GeneralInfoController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('api-service');
                    return $translate.refresh();
                }]
            }
        }).state('privacy-policy', {
            parent: 'app',
            url: '/privacy-policy',
            views: {
                'content@': {
                    templateUrl: 'app/informations/general-info/general-info.html',
                    controller: 'GeneralInfoController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('api-service');
                    return $translate.refresh();
                }]
            }
        }).state('company-introduction', {
            parent: 'app',
            url: '/company-introduction',
            views: {
                'content@': {
                    templateUrl: 'app/informations/general-info/general-info.html',
                    controller: 'GeneralInfoController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('api-service');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
