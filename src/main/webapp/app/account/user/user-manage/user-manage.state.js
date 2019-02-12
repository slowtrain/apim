(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
            .state('userManage', {
                parent: 'user',
                url: '/user-manage?page&sort',
                data: {
                    authorities: ['ROLE_USER_VIEW'],
                    pageTitle: 'global.title'
                },
                views: {
                    'content@': {
                        templateUrl: 'app/account/user/user-manage/user-manage.html',
                        controller: 'UserManageController',
                        controllerAs: 'vm'
                    }
                },
                params: {
                    page: {
                        value: '1',
                        squash: true
                    },
                    size: {
                        value: '10',
                        squash: true
                    },
                    sort: {
                        value: 'login,asc',
                        squash: true
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('user-management');
                        return $translate.refresh();
                    }]
                }
            });
    }
})();
