(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('charge-search', {
            parent: 'charge',
            url: '/account/charge/charge-search',
            data: {
                authorities: ['ROLE_HASLOGIN'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/charge/charge-search/charge-search.html',
                    controller: 'ChargeSearchController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('charge');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
