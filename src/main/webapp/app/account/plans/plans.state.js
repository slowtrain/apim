(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('plans', {
            abstract: true,
            parent: 'account',
            data:{
                thirdDepth:[
                    {name: "apiPlan", url:"apiPlan"},
                    {name: "globalPlan", url:"globalPlan"}
                ],
                depth:[1,2,3,4]
            }
        });
    }
})();
