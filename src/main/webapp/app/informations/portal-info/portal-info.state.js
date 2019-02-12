(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('portalInfos', {
            abstract: true,
            parent: 'informations',
            data:{
                depth:[1,2,3]
            }
        }).state('portal-info', {
            parent: 'portalInfos',
            url: '/portal-info',
            views: {
                'content@': {
                    templateUrl: 'app/informations/portal-info/portal-info.html',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                    $translatePartialLoader.addPart('api-service');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
