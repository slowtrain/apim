(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('apiRegister', {
            parent: 'register-step-info',
            url: '/api-register',
            views: {
                'content@': {
                    templateUrl: 'app/informations/register-step-info/api-register/api-register.html',
                    controller: 'apiRegisterController',
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
