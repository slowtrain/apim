(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('approvalManage', {
            abstract: true,
            parent: 'account',
            data: {
                thirdDepth: [
                    {name: "approval", url: "approval", authority: 'ROLE_HASLOGIN'},
                    {name: "approvalHistory", url: "approvalHistory", authority: 'ROLE_HASLOGIN'},
                    {name: "approvalLine", url: "approvalLine", authority: 'ROLE_APPROVAL_VIEW'},
                    {name: "approvalRequest", url: "approvalRequest", authority: 'ROLE_HASLOGIN'}
                ],
                depth: [1, 2, 3, 4]
            }
        });
    }
})();
