(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('charge', {
            abstract: true,
            parent: 'account',
            data:{
                thirdDepth:[
                    {name: "charge-account", url:"charge-account"},
                    {name: "charge-manage", authority: "ROLE_PLAN_VIEW", url:"charge-manage"},
                    {name: "charge-adjust", authority: "ROLE_PLAN_VIEW", url:"charge-adjust"},
                    {name: "charge-search", url:"charge-search"}
                ],
                depth:[1,2,3,4]
            }
        });
    }
})();