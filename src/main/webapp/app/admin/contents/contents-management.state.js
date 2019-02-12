(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('admin-contents-management', {
            abstract: true,
            parent: 'admin',
            data: {
                authorities: ['ROLE_ADMIN'],
                thirdDepth: [
                    {name: "admin-service-package", url: "admin-service-package"},
                    {name: "admin-popup-notice", url: "admin-popup-notice"},
                    {name: "admin-news-stand", url: "admin-news-stand"},
                    {name: "admin-service-category", url: "admin-service-category"},
                    {name: "admin-portal-terms", url: "admin-portal-terms"},
                    {name: "admin-privacy-policy", url: "admin-privacy-policy"},
                    {name: "admin-agreeform", url: "admin-agreeform"}
                ],
                depth: [1, 2, 3, 4]
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/contents/contents-management.html',
                    controller: 'ContentsManagementController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('api');
                    return $translate.refresh();
                }]
            }
        }).state('admin-popup-notice', {
            parent: 'admin-contents-management',
            url: '/admin/contents-management/popup-notice'
        }).state('admin-service-package', {
            parent: 'admin-contents-management',
            url: '/admin/contents-management/service-package'
        }).state('admin-service-category', {
            parent: 'admin-contents-management',
            url: '/admin/contents-management/service-category',
            views: {
                'content@': {
                    templateUrl: 'app/admin/contents/managing-categories.html',
                    controller: 'ManagingCategoriesController',
                    controllerAs: 'vm'
                }
            }
        }).state('admin-portal-terms', {
            parent: 'admin-contents-management',
            url: '/admin/contents-management/portal-terms'
        }).state('admin-privacy-policy', {
            parent: 'admin-contents-management',
            url: '/admin/contents-management/privacy-policy'
        }).state('admin-agreeform', {
            parent: 'admin-contents-management',
            url: '/admin/contents-management/agreeform'
        }).state('admin-news-stand', {
            parent: 'admin-contents-management',
            url: '/admin/contents-management/news-stand'
        });
    }
})();