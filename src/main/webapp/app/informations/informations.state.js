(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig ($stateProvider) {
        $stateProvider.state('informations', {
            abstract: true,
            parent: 'app',
            data:{
                secondDepth:[
                    {name: "portalInfos", url:"portal-info"},
                    //{name: "testbedInfos", url:"testbed-info"},
                    {name: "use-step-infos", url:"use-step-info"},
                    {name: "register-step-info", url:"orgUser"}
                    //{name: "service-terms", url:"service-terms"},
                    //{name: "privacy-policy", url:"privacy-policy"}
                    //{name: "company-introduction", url:"company-introduction"}
                ],
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
