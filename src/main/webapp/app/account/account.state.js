(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('account', {
            abstract: true,
            parent: 'app',
            data: {
                secondDepth: [
                    {name: "approvalManage", authority: "ROLE_HASLOGIN", url: "approval"},
                    {name: "api", authority: "ROLE_API_VIEW", url: "apiManage"},
                    {name: "plans", authority: "ROLE_PLAN_VIEW", url: "apiPlan"},
                    {name: "billing", authority: "ROLE_PLAN_VIEW", url: "billingManage"},
                    {name: "discount", authority: "ROLE_PLAN_VIEW", url: "discountManage"},
                    {name: "user", authority: "ROLE_USER_VIEW", url: "userManage"},
                    {name: "useOrgs", authority: "ROLE_PLAN_VIEW", url: "useOrgsManage"},
                    {name: "contents-provider", authority: "ROLE_PLAN_VIEW", url: "provider-service-package"},
                    {name: "settings-org", authority: "ROLE_MANAGER_PARTNER", url: "orgSetting"},
                    {name: "settings-user", authority: "ROLE_HASLOGIN", url: "userSetting"},
                    {name: "reports", authority: "ROLE_REPORT_VIEW_API", url: "report-api-using", noAdmin: true},
                    {name: "charge", authority: "ROLE_REPORT_VIEW_API", url: "charge-manage"},
                    {name: "gateway-monitor", authority: "ROLE_PLAN_VIEW", url: "gateway-monitoring"}
                    //{name: "personal", authority: "ROLE_HASLOGIN", url: "personalAgree"}
                ],
                depth: [1, 2, 3, 4]
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
