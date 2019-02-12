(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('apiTerms', {
                parent: 'api',
                url: '/terms?size&page',
                data: {
                    authorities: ['ROLE_API_VIEW'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/account/api/api-terms/api-terms.html',
                        controller: 'ApiTermsController',
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
