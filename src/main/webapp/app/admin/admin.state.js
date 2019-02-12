(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin', {
            abstract: true,
            parent: 'app',
            data: {
                secondDepth: [ //여기서 url은 state명. profiles는 표현 대상 환경, dev, test, prod 등
                    {name: "admin-organizations", url: "admin-organizations"},
                    {name: "admin-users", url: "admin-users"},
                    {name: "admin-roles", url: "admin-roles"},
                    {name: "admin-plan", url: "admin-api-plan"},
                    {name: "admin-apis", url: "admin-apis"},
                    {name: "admin-apps", url: "admin-apps"},
                    // {name: "admin-scope-management", url: "admin-scope-management"},
                    {name: "admin-contents-management", url: "admin-service-package"},
                    {name: "admin-gatewayclusters", url: "admin-gatewayclusters"},
                    {name: "admin-mailtemplates", url: "admin-mailtemplates"},
                    // {name: "admin-portal-terms", url: "admin-portal-terms-for-users"},
                    {name: "admin-report", url: "admin-report"},
                    {name: "admin-billing", url: "admin-billing"}
                    // {name: "admin-billing-token", url: "admin-billing-token"}
                    // {name: "admin-billing", url: "admin-billing", profiles: ['dev']},
                    // {name: "admin-billing-token", url: "admin-billing-token", profiles: ['dev']}
                ],
                depth: [1, 2, 3]
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
