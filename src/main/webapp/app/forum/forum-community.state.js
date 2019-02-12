(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig ($stateProvider) {
        $stateProvider.state('forum', {
            abstract: true,
            parent: 'app',
            data:{
                depth:[1,2]
            }
        });
    }
})();
