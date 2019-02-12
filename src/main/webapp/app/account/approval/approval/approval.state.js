(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('approval', {
            parent: 'approvalManage',
            url: '/approval?size&page',
            data: {
                authorities: ['ROLE_HASLOGIN'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/approval/approval/approval.html',
                    controller: 'ApprovalController',
                    controllerAs: 'vm'
                }
            },
            params: {
                size: {
                    value: '10',
                    squash: true
                },
                page: {
                    value: '0',
                    squash: true
                },
                sort: {
                    value: 'id,desc',
                    squash: true
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('approval');
                    $translatePartialLoader.addPart('api');
                    $translatePartialLoader.addPart('billing');
                    $translatePartialLoader.addPart('app-management');
                    $translatePartialLoader.addPart('user-management');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
