(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('service-package-info', {
            parent: 'service-package-open',
            url: '/service-package-info',
            views: {
                'content@': {
                    templateUrl: 'app/service-package/service-package-info/service-package-info.html',
                    controller: 'ServiceCategoryInfoController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('api-service');
                    $translatePartialLoader.addPart('api');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
