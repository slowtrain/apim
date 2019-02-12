(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('register-step-info', {
            abstract: true,
            parent: 'informations',
            data:{
                /*thirdDepth:[
                    // {name: "useApply", url:"useApply"},
                    {name: "orgUser", url:"orgUser"},
                    {name: "providerUser", url:"providerUser"}
                    // {name: "apiRegister", url:"apiRegister"}
                ],
                depth:[1,2,3,4]*/
            }
        });
    }
})();
