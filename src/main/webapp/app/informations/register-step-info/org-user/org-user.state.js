(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('orgUser', {
            parent: 'register-step-info',
            url: '/org-user',
            views: {
                'content@': {
                    templateUrl: 'app/informations/register-step-info/org-user/org-user.html',
                    controller: 'orgUserController',
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
