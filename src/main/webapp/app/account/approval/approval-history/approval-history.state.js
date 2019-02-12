(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('approvalHistory', {
            parent: 'approvalManage',
            url: '/approval-history?size&page',
            data: {
                authorities: ['ROLE_HASLOGIN'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/approval/approval-history/approval-history.html',
                    controller: 'ApprovalHistoryController',
                    controllerAs: 'vm'
                }
            },
            params: {
            	size : {
            		value: '10',
            		squash: true
            	},
            	page : {
            		value: '0',
            		squash: true
            	},
                sort : {
                    value: 'id,desc',
                    squash: true
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('approval');
                    $translatePartialLoader.addPart('api');
                    $translatePartialLoader.addPart('app-management');
                    $translatePartialLoader.addPart('billing');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
