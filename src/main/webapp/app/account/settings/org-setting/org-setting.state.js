(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('orgSetting', {
            parent: 'settings-org',
            url: '/orgSetting',
            data: {
                authorities: ['ROLE_MANAGER_PARTNER'],
                pageTitle: 'global.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/account/settings/org-setting/org-setting.html',
                    controller: 'OrgSettingController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                $uibModalInstance: function () {
                    return 0
                },
                selectedOrg: function () {
                    return 0
                },
                translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('settings');
                    return $translate.refresh();
                }]
            }
        });
    }
})();
