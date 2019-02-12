(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig ($stateProvider) {
        $stateProvider.state('discount', {
            abstract: true,
            parent: 'account',
            data:{
                depth:[1,2,3]
            }
        });
    }
})();
