(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('apiService', {
            parent: 'apiServices',
            url: '/api-service?size&page',
            data: {
                //authorities: ['ROLE_HASLOGIN'],
                pageTitle: 'global.title'
            },
            views: {
                'contentAll@': {
                    templateUrl: 'app/api-services/api-service/api-service.html',
                    controller: 'ApiServiceController',
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
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('api-service');
                    $translatePartialLoader.addPart('app-management');
                    $translatePartialLoader.addPart('api');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
