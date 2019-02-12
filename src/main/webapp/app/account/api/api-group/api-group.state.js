(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('apiGroup', {
                parent: 'api',
                url: '/apigroups?size&page',
                data: {
                    authorities: ['ROLE_API_CREATE'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/account/api/api-group/api-group.html',
                        controller: 'ApiGroupController',
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
                        return $translate.refresh();
                    }]
                }
            });
    }
})();
