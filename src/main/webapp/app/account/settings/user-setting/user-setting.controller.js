(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('UserSettingsController', UserSettingsController);

    UserSettingsController.$inject = ['CommonConstants', 'User', '$state', '$uibModal', 'Principal', 'Auth', 'JhiLanguageService', '$translate', 'Account', 'CommonUtil'];

    function UserSettingsController (CommonConstants, User, $state, $uibModal, Principal, Auth, JhiLanguageService, $translate, Account, CommonUtil) {
        var vm = this;

        vm.error = null;
        vm.save = save;
        vm.withdraw = withdraw;
        vm.settingsAccount = null;
        vm.success = null;
        vm.mainPhone = [];
        vm.cellPhone = [];

        vm.changePass = false;

        vm.districtNums = CommonConstants.districtNums;
        vm.cellIdentifyingNums = CommonConstants.cellIdentifyingNums;

        vm.passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[~!@#$%^&*\-_+=|\\]).{8,20}$/;

        /**
         * Store the "settings account" in a separate variable, and not in the shared "account" variable.
         */
        var copyAccount = function (account) {
            return {
                login: account.login,
                maskingEmail: account.maskingEmail,
                maskingMainPhone: account.maskingMainPhone,
                maskingCellPhone: account.maskingCellPhone,
                grade: account.grade,
                fullName: account.fullName,
                showNotice: account.showNotice
            };
        };

        Principal.identity().then(function(account) {
            vm.settingsAccount = copyAccount(account);
            vm.hideNotice = (vm.settingsAccount.showNotice)? false: true;
        });

        function save () {
            if(vm.modifyMainPhone){
                vm.settingsAccount.mainPhone = (vm.mainPhone.length=='3')? vm.mainPhone[0]+'-'+vm.mainPhone[1]+'-'+vm.mainPhone[2]: null;
            }else vm.settingsAccount.mainPhone = null;
            if(vm.modifyCellPhone){
                vm.settingsAccount.cellPhone = (vm.cellPhone.length=='3')? vm.cellPhone[0]+'-'+vm.cellPhone[1]+'-'+vm.cellPhone[2]: null;
            }else vm.settingsAccount.cellPhone = null;
            if(vm.modifyEmail) {
                vm.settingsAccount.email = vm.email;
            }else vm.settingsAccount.email = null;
            vm.settingsAccount.showNotice = !vm.hideNotice;
            User.updateMyInfo(vm.settingsAccount, (vm.changePass)? onChangePass: onSuccess, onError);
          //changePassword를 user Update보다 먼저하면 비밀번호만 변경되고 다른정보는 변경 안 된다.
        }

        function onChangePass(){
            Auth.changePassword(null, vm.password, function(error){
                if(error) onError(error);
                else onSuccess();
            });
        }

        function onSuccess(){
            vm.changePass = false;
            vm.modifyMainPhone = false;
            vm.modifyCellPhone = false;
            vm.modifyEmail = false;
            vm.mainPhone = [];
            vm.cellPhone = [];
            vm.email = "";
            vm.password = "";
            vm.confirmPassword = "";
            Principal.identity(true).then(function(account) {
              vm.settingsAccount = copyAccount(account);
            });
            window.localStorage.setItem('showNotice', vm.settingsAccount.showNotice); //팝업공지 안보기 설정을 적용하기 위한 코딩
            CommonUtil.onError("변경사항이 적용되었습니다.", '', '', '','변경 확인');
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function logout() {
            Auth.logout();
            $state.go('home');
        }

        function withdraw() {
            var message = "탈퇴를 신청하면 다시 로그인할 수 없습니다.<br/>탈퇴를 신청하시겠습니까?";
            var func = function(result){
                if(result) proceedWithdraw();
            };
            CommonUtil.onError(message, '', 'withdraw', func, '탈퇴확인');
        }

        function proceedWithdraw() {
            Account.withdraw().$promise.then(function (response) {
                $uibModal.open({
                    templateUrl: 'app/services/common/modal.html',
                    controller: 'modalController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'sm',
                    resolve: {
                        items: {
                            message : response.description,
                            type : 'withdrawConfirm'
                        }
                    }
                }).result.then(function(result){
                    if(result) logout();
                });
            }, function (error) {
                $uibModal.open({
                    templateUrl: 'app/services/common/modal.html',
                    controller: 'modalController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'sm',
                    resolve: {
                        items: {
                            message : error.data.description,
                            type : 'error'
                        }
                    }
                });
            });
        }
    }
})();
