(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig ($stateProvider) {
        $stateProvider.state('apiServices', {
            abstract: true,
            parent: 'app',
            data:{
                /*secondDepth:[
                    {name: "apiInfo", url:"apiInfo"},
                    {name: "apiService", url:"apiService"}
                ],*/
                depth:[1,2]
            },
            views: {
                'lnbBack@': {
                    templateUrl: 'app/layouts/lnb-back/lnb-back.html'
                }
            }
        });
    }
})();
