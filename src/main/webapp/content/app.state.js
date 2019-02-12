(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('app', {
            abstract: true,
            data: {
                firstDepth: [
                    //{name: 'home', url: 'home'},
                    {name: 'informations', url: 'portal-info'},
                    {name: 'apiService', url: 'apiService'},
                    {name: 'appManagement', url: 'appManage', authority: 'ROLE_APP_VIEW'},
                    {name: 'forumCommunity', url: 'forumCommunity'},
                    {name: 'account', url: 'approval', authority: 'ROLE_HASLOGIN'},
                    {name: 'admin', url: 'admin-organizations', authority: 'ROLE_ADMIN'},
                    {name: 'service-package-open', url: 'service-package-info'}
                ]
            },
            views: {
                'navbar@': {
                    templateUrl: 'app/layouts/navbar/navbar.html',
                    controller: 'NavbarController',
                    controllerAs: 'vm'
                },
                'footer@': {
                    templateUrl: 'app/layouts/footer/footer.html',
                    controller: 'FooterController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                authorize: ['Auth',
                    function (Auth) {
                        return Auth.authorize();
                    }
                ],
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('global');
                }]
            }
        });
    }
})();
