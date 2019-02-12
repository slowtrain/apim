(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin-plan', {
            abstract: true,
            parent: 'admin',
            data:{
                thirdDepth:[
                  //{name: "admin-account-plan", url:"admin-account-plan"},
                    {name: "admin-api-plan", url:"admin-api-plan"}
                ],
                depth: [1, 2, 3, 4]
            }
        });
    }
})();
