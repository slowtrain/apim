(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('UserManageDialogController', UserManageDialogController);

    UserManageDialogController.$inject = ['CommonConstants', 'CommonUtil', '$state', '$stateParams', '$uibModalInstance', 'selections', 'Principal', 'User', 'Role', 'JhiLanguageService'];

    function UserManageDialogController(CommonConstants, CommonUtil, $state, $stateParams, $uibModalInstance, selections, Principal, User, Role, JhiLanguageService) {
        var vm = this;

        vm.authorities = ['ROLE_USER_VIEW'];

        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.displayActivated = displayActivated;
        vm.findRolesByOrgType = findRolesByOrgType;
        vm.setAdmin = setAdmin;
        vm.user = {};
        vm.mainPhone = [];
        vm.cellPhone = [];
        vm.flagOfOrg = false;
        vm.modifyEmail = false;
        vm.isAdmin = selections.isAdmin;
        vm.roles = selections.roles;
        vm.orgs = [];
        vm.flagOfRegister = true;

        vm.districtNums = CommonConstants.districtNums;
        vm.cellIdentifyingNums = CommonConstants.cellIdentifyingNums;

        if (selections.user) {
            vm.user = angular.copy(selections.user);
            vm.user.active = (selections.user.state == 'ACTIVE');
            vm.flagOfOrg = true;
            vm.flagOfRegister = false;
            vm.orgs.push(vm.user.organization);

            var originalFlagOfAdmin = (selections.user.authorities.indexOf('ROLE_ADMIN') > -1)? true : false;
            vm.flagOfAdmin = angular.copy(originalFlagOfAdmin);

        } else if (selections.refOrg) {
            vm.user.organization = selections.refOrg;
            vm.orgs.push(vm.user.organization);
            vm.flagOfOrg = true;
        }

        findRolesByOrgType();
        function findRolesByOrgType(){
            Role.list().$promise.then(function (response) {
                vm.roles = response.filter(function(role){
                    return (vm.user.organization)? role.organizationType == vm.user.organization.type : true;
                });
            });
        }

        function displayActivated() {
            switch (vm.user.state) {
                case 'ACTIVE':
                    return "활성";
                case 'INACTIVE':
                    return "비활성";
                case 'REGISTERING':
                    return "등록 진행중";
                case 'WITHDRAWING':
                    return "탈퇴 진행중";
            }
        }

        vm.emailTooltip = false;
        vm.mode = (vm.flagOfRegister) ? "register" : "edit";

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear() {
            if(!vm.saveRoleAdmin) vm.user = selections.user;
            $uibModalInstance.close('cancel'); //페이지 refresh를 위해서 dismiss대신 close를 사용.
        }

        function onSuccess(result) {
            $uibModalInstance.close(result);
        }

        function onError(error) {
            if(vm.noSetAdmin) CommonUtil.onError(error.data.description);
            else {
                User.setAdmin({userId: user.id, flag: originalFlagOfAdmin});
                CommonUtil.onError(error.data.description);
            }
        }

        vm.noSetAdmin = true;
        function setAdmin() {
            if(selections.type && selections.type=='detailView'){
                User.setAdmin({userId: vm.user.id, flag: !vm.flagOfAdmin}, function(){ vm.flagOfAdmin=!vm.flagOfAdmin; vm.saveRoleAdmin=true; }, onError);
            }else{
                if (originalFlagOfAdmin != vm.flagOfAdmin){
                    User.setAdmin({userId: vm.user.id, flag: vm.flagOfAdmin}, function(){ vm.noSetAdmin=false; save();}, onError);
                }else {
                    save();
                }
            }
        }

        function save() {
            if (vm.modifyMainPhone || vm.flagOfRegister)
                vm.user.mainPhone = (vm.mainPhone.length == '3') ? vm.mainPhone[0] + '-' + vm.mainPhone[1] + '-' + vm.mainPhone[2] : null;

            if (vm.modifyCellPhone || vm.flagOfRegister)
                vm.user.cellPhone = (vm.cellPhone.length == '3') ? vm.cellPhone[0] + '-' + vm.cellPhone[1] + '-' + vm.cellPhone[2] : null;

            if (vm.modifyEmail || vm.flagOfRegister)
                vm.user.email = vm.email;

            vm.user.state = (vm.user.active) ? 'ACTIVE' : 'INACTIVE';

            if (selections.user) {
                User.update(vm.user, onSuccess, onError);
            } else {
                User.save(vm.user, function() { onSuccess('create') }, onError);
            }
        }

        vm.lengthCheck = lengthCheck;
        function lengthCheck(type, val) {
            vm.cellPhoneLength = [];
            vm.mainPhoneLength = [];
            vm.lengthChecked = false;

            val.forEach(function (n) {
                if (type == 'cellPhone') {
                    if (n) vm.cellPhoneLength.push(n);
                } else if (type == 'mainPhone') {
                    if (n) vm.mainPhoneLength.push(n);
                }
            });
            if (vm.cellPhoneLength.length == 1 || vm.cellPhoneLength.length == 2) vm.lengthChecked = true;
            if (vm.mainPhoneLength.length == 1 || vm.mainPhoneLength.length == 2) vm.lengthChecked = true;

        }

    }
})();
