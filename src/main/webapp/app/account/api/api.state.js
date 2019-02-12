(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('api', {
            abstract: true,
            parent: 'account',
            data: {
                thirdDepth: [
                    {name: "apiManage", url: "apiManage", authority: "ROLE_API_VIEW"},
                    {name: "apiGroup", url: "apiGroup", authority: "ROLE_API_VIEW"},
                    {name: "apiTerms", url: "apiTerms", authority: "ROLE_API_VIEW"}
                ],
                depth: [1, 2, 3, 4]
            }
        });
    }
})();
