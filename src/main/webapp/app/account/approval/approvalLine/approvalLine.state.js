(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('approvalLine', {
            parent: 'approvalManage',
            url: '/approvalLine?size&page',
            data: {
                authorities : ['ROLE_APPROVAL_VIEW'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/approval/approvalLine/approvalLine.html',
                    controller: 'ApprovalLineController',
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
                    $translatePartialLoader.addPart('api');
                    $translatePartialLoader.addPart('approval');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
