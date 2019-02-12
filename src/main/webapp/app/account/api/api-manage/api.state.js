(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('apiManage', {
            parent: 'api',
            url: '/apis?size&page',
            data: {
                authorities: ['ROLE_API_VIEW'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/api/api-manage/api.html',
                    controller: 'ApiController',
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
                    $translatePartialLoader.addPart('api');
                    $translatePartialLoader.addPart('approval');
                    $translatePartialLoader.addPart('app-management');
                    $translatePartialLoader.addPart('billing');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
