(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('RoleDialogController', RoleDialogController);

    RoleDialogController.$inject = ['CommonUtil', '$uibModalInstance', 'selections', 'Role', 'AlertService', 'JhiLanguageService'];

    function RoleDialogController(CommonUtil, $uibModalInstance, selections, Role, AlertService, JhiLanguageService) {

        var vm = this;
        vm.languages = null;
        vm.authorities = ['ROLE_ADMIN'];
        vm.mode = selections.mode;
        vm.save = save;
        vm.clear = clear;
        vm.role = (vm.mode == "edit") ? angular.copy(selections.role) : {organizationType : 'PROVIDER'};

        function save() {
            var flag1 = false, flag2 = false;

            if (vm.mode == "register") {
                selections.allData.some(function(role){
                    if (role.name == vm.role.name) {
                        flag1 = true;
                    }
                    if (role.code == vm.role.code) {
                        flag2 = true;
                    }
                    return flag1 || flag2;
                });
                if(flag1) {CommonUtil.onError("역할이름이 중복되었습니다."); return;}
                if(flag2) {CommonUtil.onError("역할코드가 중복되었습니다."); return;}
                Role.create(vm.role, onSuccess, onError);
            } else {
                selections.allData.some(function(role){
                    if (selections.role.name != vm.role.name && role.name == vm.role.name) {
                        flag1 = true;
                    }
                    if (selections.role.code != vm.role.code && role.code == vm.role.code) {
                        flag2 = true;
                    }
                    return flag1 || flag2;
                });
                if(flag1) {CommonUtil.onError("역할이름이 중복되었습니다."); return;}
                if(flag2) {CommonUtil.onError("역할코드가 중복되었습니다."); return;}
                Role.update(vm.role, onSuccess, onError);
            }
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear() {
            vm.role = (vm.mode == "edit") ? selections.role: {};
            $uibModalInstance.dismiss('cancel');
        }

        function onSuccess(result) {
            vm.isSaving = false;
            $uibModalInstance.close(result);
        }

        function onError(error) {
            vm.isSaving = false;
            CommonUtil.onError(error.data.description);
        }
    }
})();
