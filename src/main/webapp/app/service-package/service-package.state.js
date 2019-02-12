(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig ($stateProvider) {
        $stateProvider.state('service-package-open', {
            abstract: true,
            parent: 'app',
            data:{
                depth:[1,2,3]
            },
            views: {
                'lnbBack@': {
                    templateUrl: 'app/layouts/lnb-back/lnb-back.html'
                },
                'lnb@': {
                    templateUrl: 'app/layouts/lnb/lnb.html',
                    controller: 'LnbController',
                    controllerAs: 'vm'
                }
            }
        });
    }
})();
