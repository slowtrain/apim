(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('reports', {
            abstract: true,
            parent: 'account',
            data: {
                thirdDepth: [
                    {name: "report-api-using", url: "report-api-using"},
                    {name: "report-api-providing", authority: "ROLE_PLAN_VIEW", url: "report-api-providing"},
                    {name: "report-billing-using", url: "report-billing-using"},
                    {name: "report-billing-providing", authority: "ROLE_PLAN_VIEW", url: "report-billing-providing"},
                    //{name: "report-token", url: "report-token"}
                ],
                depth: [1, 2, 3, 4]
            }
        });
    }
})();
