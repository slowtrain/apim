(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('testbedInfos', {
            abstract: true,
            parent: 'informations',
            data:{
                depth:[1,2,3]
            }
        }).state('testbed-info', {
            parent: 'testbedInfos',
            url: '/testbed-info',
            views: {
                'content@': {
                    templateUrl: 'app/informations/testbed-info/testbed-info.html',
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
