(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('use-step-infos', {
            abstract: true,
            parent: 'informations',
            data:{
                depth:[1,2,3]
            }
        }).state('use-step-info', {
            parent: 'use-step-infos',
            url: '/use-step-info',
            views: {
                'content@': {
                    templateUrl: 'app/informations/use-step-info/use-step-info.html',
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
