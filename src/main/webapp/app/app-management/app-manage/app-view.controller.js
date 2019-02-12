(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AppViewController', AppViewController);

    AppViewController.$inject =['Principal', 'Code', '$uibModalInstance', '$uibModal', 'selectApp', '$scope', '$state', 'Apps', 'Api', 'ApiGroup', 'CommonUtil'];

    function AppViewController(Principal, Code, $uibModalInstance, $uibModal, selectApp, $scope, $state, Apps, Api, ApiGroup, CommonUtil) {
        //신규 추가일 경우 초기값 설정
        if (!selectApp) selectApp = {
            version: 1
        };

        var vm = this;
        vm.state = $state;

        vm.authorities = ['ROLE_APP_VIEW'];
        vm.appDetail = selectApp;
        vm.apiList = vm.appDetail.appApiMappings;

        vm.clear = clear;
        vm.closeTerm = closeTerm;
        vm.showTermsContent = showTermsContent;
        vm.clickSecretButton = clickSecretButton;
        vm.completeSecret = completeSecret;
        vm.getSecret = getSecret;
        vm.splitContents = splitContents;
        vm.parsingScopeValue = parsingScopeValue;
        vm.tooltipControl = tooltipControl;
        vm.fileDown = CommonUtil.fileDown;
        vm.fileSize = CommonUtil.fileSize;
        vm.filter = filter;

        vm.apiAttachFileListPopover = {
            templateUrl: 'app/layouts/popover-template/api-attachfilelist-popover.html'
        };

        vm.apiplanPopover = {
            templateUrl: 'app/layouts/popover-template/apiplan-popover.html'
        };

        function filter(value, choice){
            var result='';
            if(choice ==1){
                vm.quotaValueUseCycleOption.some(function(option){
                    if(value==option.val) result = option.name;
                    return value==option.val;
                });
                return result;
            }else{
                vm.dayLimitOption.some(function(option){
                    if(value==option.val) result = option.name;
                    return value==option.val;
                });
                return result;
            }
        }

        vm.quotaValueUseCycleOption = [
            {val:'SECOND', name:'초'},
            {val:'MINUTE', name:'분'},
            {val:'HOUR', name:'시'},
            {val:'DAY', name:'일'},
            {val:'MONTH', name:'월'}
        ];

        vm.dayLimitOption = [
            {val:'SUNDAY', name:'일'},
            {val:'MONDAY', name:'월'},
            {val:'TUESDAY', name:'화'},
            {val:'WEDNESDAY', name:'수'},
            {val:'THURSDAY', name:'목'},
            {val:'FRIDAY', name:'금'},
            {val:'SATURDAY', name:'토'}
        ];

        function tooltipControl(selectedApi) {
            if (selectedApi.tooltipOpen) selectedApi.tooltipOpen = false;
            else {
                vm.apiList.forEach(function (api) {
                    api.api.tooltipOpen = false;
                });
                Api.getAttachFiles({apiId: selectedApi.id}).$promise.then(function(response){
                    vm.selectedApi = response;
                    selectedApi.tooltipOpen = true;
                });
            }
        }

        Apps.changeSet({id: vm.appDetail.id}).$promise.then(function(response){
            vm.changeSets = response.changeSets;
        });

        Principal.hasAuthority('ROLE_ADMIN').then(function(result){
            if(result) vm.isAdmin = true;
        });

        vm.isManagerOrUser = Principal.hasAnyAuthority(['ROLE_MANAGER', 'ROLE_USER']);
        vm.whiteList = vm.appDetail.whiteList? vm.appDetail.whiteList.split('|') : [];

        vm.scopes = Code.scopeTypes();

        vm.appScopes = [];
        if (vm.appDetail.oAuthScope){
            vm.appDetail.oAuthScope.split(' ').forEach(function(value){
                vm.appScopes.push({scope: value});
            });
        }

        function parsingScopeValue(scope){
            vm.existingScope = false;
            vm.scopes.some(function(original){
                if (original.scope == scope.scope) {
                    vm.existingScope = true;
                    scope.name = original.name;
                }
                return original.scope == scope.scope;
            });
        }

        function splitContents(changeSet){
            changeSet.fromInfos =(changeSet.from)? changeSet.from.split(' | '): null;
            changeSet.toInfos =(changeSet.to)? changeSet.to.split(' | '): null;
        }

        vm.termPopover = {
            templateUrl: 'app/layouts/popover-template/content-popover.html'
        };

        vm.secretPopover = {
            templateUrl: 'app/layouts/popover-template/secret-popover.html'
        };

        function completeSecret() {
            vm.isOpen = false; //app-view 화면에서 사용
            vm.popOpen = false; //app 수정 화면에서 사용
        }

        function clickSecretButton() {
            vm.isOpen = true;
            vm.initSecret = true;
            vm.password = "";
        }

        function getSecret() {
            if(!vm.password || vm.password.trim() == '') {
                vm.tooltipIsOpen = true;
                $("#password").focus();
                return;
            }
            Apps.getSecret({id:vm.appDetail.id, password:vm.password}, function(result){
                vm.secret = result.secret;
                vm.password = null;
                vm.initSecret = false;
            }, onError);
        }

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function onSuccess (result) {
            $uibModalInstance.close(result);
        }

        function onError(error){
            vm.popOpen = false;
            CommonUtil.onError(error.data.description);
        }

        function showTermsContent(api) {
            if(api.termsOfUse) {
                Api.getTermsContent({id:api.termsOfUse.id}).$promise.then(function (response) {
                    $uibModal.open({
                        templateUrl: 'app/services/common/terms-modal.html',
                        controller: 'termsModalController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            item: response
                        }
                    }).result.then(function (result) {

                    });
                });
            }
            //layout 방식
//        	if(api.termsOfUse) {
//        		vm.isTermsOpen = true;
//        		vm.termContent = api.termsOfUse.content;
//        	} else {
//        		vm.isTermsOpen = false;
//        	}
        }

        function closeTerm() {
            vm.isTermsOpen = false;
        }
    }
})();
