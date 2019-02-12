(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('RequestResetController', RequestResetController);

    RequestResetController.$inject = ['$scope', '$state', 'CommonUtil', '$timeout', 'Auth', 'Account', 'Principal'];

    function RequestResetController ($scope, $state, CommonUtil, $timeout, Auth, Account, Principal) {
        var vm = this;

//        vm.error = null;
//        vm.errorEmailNotExists = null;
        vm.requestReset = requestReset;
//        vm.resetAccount = {};
//        vm.success = null;
        vm.searching = searching;
        vm.isDormant = $scope.account? Principal.isDormant() : false;

        function searching(){
            /*Account.resetPasswordAuth(vm.user).$promise.then(function(response){
                if(response) onSuccess();
            });*/
            Account.resetPasswordAuth(vm.user, onSuccess, onError);
        }

        $timeout(function (){angular.element('#email').focus();});

        function requestReset () {
            // 아래의 type은 실제로 적용되지 않는다.
            // 운영자 - sms 템플릿 관리에서 [사용자 계정 비밀번호 초기화 안내] 항목의 전송방식 설정(sms or email)에 따른다.
            Account.resetPasswordSend({type: 'sms'}, vm.user, gotoState, onError);

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

        function onSuccess(){
            vm.searchResult = true;
            requestReset();
        }

        function gotoState(){
            var func = function(result){
                if(result) {
                    Auth.logout(); $state.go('login');
                }
            };
            CommonUtil.onError("임시비밀번호가 전송되었습니다.", '', 'modify', func, '전송 확인');
        }

        function onError(error){
            CommonUtil.onError(error.data.description);
            vm.searchResult = false;
        }
    }
})();
