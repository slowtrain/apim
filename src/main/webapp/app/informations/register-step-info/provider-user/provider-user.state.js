(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('providerUser', {
            parent: 'register-step-info',
            url: '/provider-user',
            views: {
                'content@': {
                    templateUrl: 'app/informations/register-step-info/provider-user/provider-user.html',
                    controller: 'ProviderUserController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    return $translate.refresh();
                }]
            }
        });
    }
})();
