(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ChangePasswordController', ChangePasswordController);

    ChangePasswordController.$inject = ['$rootScope', 'CommonUtil', 'Auth', '$state', 'Principal', '$window'];

    function ChangePasswordController ($rootScope, CommonUtil, Auth, $state, Principal, $window) {
        var vm = this;
        vm.save = save;
        vm.passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[~!@#$%^&*\-_+=|\\]).{8,20}$/;
        getAccount();

        function getAccount(){
            Principal.identity().then(function(account) {
                vm.account = account;
                if(!vm.account.expiredPassword) $state.go('home');
            });
        }

        function save(){
            Auth.changePassword(vm.currentPassword, vm.newPassword, function(error){
                if(error) onError(error);
                else onSuccess();
            });
        }

        function onSuccess(){
            CommonUtil.onError('비밀번호가 변경되었습니다.<br/>다시 로그인해 주십시오.', null, 'modify', function(result) {
                if(result) {
                    Auth.logout();
                    $rootScope.$broadcast('userLogout');
                    $state.go('login');
                }
            },'변경 확인');
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();
