(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('FindIdController', FindIdController);

    FindIdController.$inject = ['CommonConstants', '$state', 'CommonUtil', '$timeout', 'Auth', 'Account'];

    function FindIdController (CommonConstants, $state, CommonUtil, $timeout, Auth, Account) {
        var vm = this;

        vm.cellIdentifyingNums = CommonConstants.cellIdentifyingNums;
        vm.cellPhone = [];

//        vm.error = null;
//        vm.errorEmailNotExists = null;
        vm.requestReset = requestReset;
//        vm.resetAccount = {};
//        vm.success = null;
        vm.searching = searching;

        function searching(){
            /*Account.resetPasswordAuth(vm.user).$promise.then(function(response){
                if(response) onSuccess();
            });*/
            vm.user.cellPhone = vm.cellPhone.join('-');
            Account.findId(vm.user, onSuccess, onError);
        }

        $timeout(function (){angular.element('input[name=fullName]').focus();});

        function requestReset () {
            Account.resetPasswordSend({type: vm.type}, vm.user, goHome, onError);

            /*vm.error = null;
            vm.errorEmailNotExists = null;

            Auth.resetPasswordInit(vm.resetAccount.email).then(function () {
                vm.success = 'OK';
            }).catch(function (response) {
                vm.success = null;
                if (response.status === 400 && response.data === 'e-mail address not registered') {
                    vm.errorEmailNotExists = 'ERROR';
                } else {
                    vm.error = 'ERROR';
                }
            });*/
        }

        function onSuccess(data){
            vm.searchResult = true;
            vm.response = data;
        }

        function goHome(){
            var func = function(result){
                if(result) $state.go('home');
            };
            CommonUtil.onError("전송 완료되었습니다.", '', 'modify', func, '전송 확인');
        }

        function onError(error){
            CommonUtil.onError(error.data.description);
            vm.searchResult = false;
        }
    }
})();
