(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ScopeManagementDialogController', ScopeManagementDialogController);

    ScopeManagementDialogController.$inject =['CommonUtil', '$uibModalInstance', 'JhiLanguageService', 'selections', 'Scopes'];

    function ScopeManagementDialogController(CommonUtil, $uibModalInstance, JhiLanguageService, selections, Scopes) {

    	var vm = this;
        vm.clear = clear;
        vm.languages = null;
        vm.authorities = ['ROLE_ADMIN'];
        vm.selections = selections;
        vm.scope = (selections)? angular.copy(selections) : {};
        vm.save = save;

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear () {
            vm.scope = selections;
            $uibModalInstance.dismiss();
        }

        function onSuccess (result) {
            $uibModalInstance.close(result);
        }

        function onError (error) {
            CommonUtil.onError(error.data.description);
        }

        function save () {
            if(selections){
                Scopes.update(vm.scope, onSuccess, onError);
            }else{
                Scopes.create(vm.scope, function() { onSuccess('create') }, onError);
            }
        }
    }
})();
