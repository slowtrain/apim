(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('discountManage', {
            parent: 'discount',
            url: '/discountManage',
            data: {
                authorities: ['ROLE_PLAN_VIEW'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/discount/discount-manage/discount-manage.html',
                    controller: 'DiscountManageController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('discount');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
