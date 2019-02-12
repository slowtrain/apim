(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AppDialogController', AppDialogController);

    AppDialogController.$inject = ['CommonUtil', '$uibModalInstance', 'selectApp', 'Apps', 'JhiLanguageService','apiPlans', '$timeout'];

    function AppDialogController(CommonUtil, $uibModalInstance, selectApp, Apps, JhiLanguageService, apiPlans, $timeout) {
        //신규 추가일 경우 초기값 설정
        if (!selectApp) selectApp = {
            version: 1
        };

        var vm = this;
        vm.authorities = ['ROLE_APP_CREATE'];
        vm.app = selectApp;
        vm.clear = clear;
        vm.languages = null;
        vm.save = save;


        vm.requiredAuths = ["NONE","API_KEY", "OAUTH1", "OAUTH2"];
        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function onSuccess (result) {
            $uibModalInstance.close(result);
        }

        function onError (error) {
        	CommonUtil.onError(error.data.description);
        }

        function save (form) {
            //vm.app.applicablePlans = vm.selectedPlans;
            //id가 없으면 create, 있으면 update
            if(!vm.app.id){
            	Apps.create(vm.app, onSuccess, onError);
            }else{
            	Apps.update(vm.app, onSuccess, onError);
            }
        }
    }
})();
