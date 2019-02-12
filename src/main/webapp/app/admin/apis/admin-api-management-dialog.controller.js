(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AdminApiManagementDialogController', AdminApiManagementDialogController);

    AdminApiManagementDialogController.$inject = ['CommonConstants', '$uibModalStack', '$compile', '$uibModalInstance', '$scope', '$uibModal', 'selectedApi', 'Api', 'Code', 'JhiLanguageService', 'apiPlans', 'Gateway', '$timeout', 'CommonUtil'];

    function AdminApiManagementDialogController(CommonConstants, $uibModalStack, $compile, $uibModalInstance, $scope, $uibModal, selectedApi, Api, Code, JhiLanguageService, apiPlans, Gateway, $timeout, CommonUtil) {

        var vm = this;
        var xsrf_token = CommonUtil.getCookie("XSRF-TOKEN");
        //신규 추가일 경우 초기값 설정

        if (selectedApi) {
            vm.mode = 'modify';
            vm.api = angular.copy(selectedApi);
            vm.termsOn = !!selectedApi.termsOfUse;
            var originalName = selectedApi.name;
            var originalUrl = selectedApi.urlPattern;
            if (vm.api.fragments && !!vm.api.fragments.length) {
                refreshFragment();
//                vm.selectedFragment = vm.api.fragments[0].fragment;
//                vm.selectedFragment.parameters = [];
//                vm.selectedFragment.parameters = vm.api.fragments[0].parameters;
//                changeFragment();
            }
        }

        vm.authorities = ['ROLE_API_CREATE'];
        vm.changeGatewayCluster = changeGatewayCluster;
        vm.changeFragment = changeFragment;
        vm.refreshFragment = refreshFragment;
        vm.clear = clear;
        vm.clearTopModal = clearTopModal;
        vm.languages = null;
        vm.billingPolicies = null;
        vm.closeTerm = closeTerm;
        vm.closeBillingPolicy = closeBillingPolicy;
        vm.selectedPlans = (selectedApi)? vm.api.applicablePlans: [];
        vm.isOpen = false;
        vm.allSelect = false;
        vm.showTermsContent = showTermsContent;
        vm.termContent = "약관을 선택해주세요.";

        vm.showBillingPolicies = showBillingPolicies;
        vm.billingPolicytooltipIsOpen = false;
        vm.isbillingPoliciesOpen = false;
        vm.loadAll = loadAll;
        vm.fileDown = fileDown;
        vm.fileSize = CommonUtil.fileSize;
        vm.filter = filter;
        vm.messageLimitCheckSize = 20 * 1024;
        vm.toNumFormat = toNumFormat;

        if (!vm.api.fragments) vm.api.fragments = [];
        if (!vm.api.gatewayCluster) vm.api.gatewayCluster = [];

        // 수정 모드면
        vm.gatewayClusterDisabled = vm.api.gatewayCluster.length != 0;
        vm.fragmentDisabled = vm.api.fragments.length != 0;

        //vm.loadAll();

        function toNumFormat (parameter) {
            parameter.value = numeral(parameter.value).format('0,0');
        }

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

        function scopesLoad(){
            Code.scopeTypes().$promise.then(function(response){
                vm.scopes = response;
                gatewayClustersLoad();
            }).catch(onError);
        }

        vm.apiplanPopover = {
            templateUrl: 'app/layouts/popover-template/apiplan-popover.html'
        };

        vm.sqlhelpPopover = {
            templateUrl: 'app/layouts/popover-template/sqlhelp-popover.html'
        };

        vm.injectionhelpPopover = {
            templateUrl: 'app/layouts/popover-template/injectionhelp-popover.html'
        };

        vm.termPopover = {
            templateUrl: 'app/layouts/popover-template/content-popover.html'
        };

        function fileDown(file) {
            if ($scope.account) window.location = '/files/download/' + file.id;
        }

        function loadAll() {
            if (vm.api.id) {
                Api.apiById({id: vm.api.id}).$promise.then(function (response) {
                    vm.api = response;
                    scopesLoad();
                    loadAuthenticationTypes();
                });
            }
        }

        function loadAuthenticationTypes() {
//            Code.authenticationTypes().$promise.then(function (result) {
//                vm.requiredAuths = result;
//            });
        }

        function gatewayClustersLoad() {
            if (!vm.api.id) { // 등록모드에서만 실행
                Gateway.listCluster().$promise.then(function (response) {
                    vm.gatewayClusters = response;
                    // 클러스터가 1개인 경우 자동 선택되도록 함
                    if (vm.gatewayClusters && vm.gatewayClusters.length == 1) {
                        vm.api.gatewayCluster = vm.gatewayClusters[0];
                    }
                    vm.changeGatewayCluster();
                });
            }
        }

        // gateway cluster를 선택했을 때
        function changeGatewayCluster() {
            if (vm.api.gatewayCluster) {
                fragmentsLoad();
            } else {
                vm.fragments = [];
            }
        }

        function fragmentsLoad() {
            if (vm.api.gatewayCluster.id != null) {
                Gateway.listFragments({clusterId: vm.api.gatewayCluster.id}).$promise.then(function (response) {
                    vm.fragments = response;

                    // fragment가 1개인 경우 선택되도록 함
                    if (vm.fragments && vm.fragments.length == 1) {
                        if (!vm.api.fragments[0]) vm.api.fragments[0] = {};
                        vm.api.fragments[0].fragment = vm.fragments[0];
                        vm.selectedFragment = vm.fragments[0];
                        vm.fragmentDisabled = true;
                        vm.changeFragment();
                    }
                });
            }
        }

        function refreshFragment() {
            Gateway.listCluster().$promise.then(function (response) {
                vm.gatewayClusters = response;
                Gateway.listFragments({clusterId: vm.api.gatewayCluster.id}).$promise.then(function (response) {
                    vm.fragments = response;
                    vm.fragments.some(function(fragment){
                        if (fragment.id == vm.api.fragments[0].fragment.id) vm.selectedFragment = fragment;
                        return fragment.id == vm.api.fragments[0].fragment.id;
                    });
                    vm.selectedFragment.parameters = []; // 게이트웨이에서 가져온 원본 fragment에는 arguments만 있고, parameters라는 키 자체가 없다.
                    vm.selectedFragment.arguments.forEach(function (s_argument) {
                        vm.selectedFragment.parameters.push({ // argument의 id 키를 제외하고, 나머지 키만 배열로 재구성한다.
                            key : s_argument.name,
                            label : s_argument.label,
                            type : s_argument.type,
                            value : s_argument.type=='boolean'? 'false' : null
                        });
                    });
                    changeFragment();
                });
            });
        }

        function changeFragment() {
            // 등록시 fragment 설정
            if (!vm.api.fragments[0]) {
                vm.selectedFragment.parameters = [];
                vm.api.fragments[0] = { fragment : vm.selectedFragment };
            }

            if (vm.api.fragments[0].fragment) {
                // 수정시 fragment 설정
                if (vm.api.fragments != null && vm.api.fragments.length > 0 && vm.selectedFragment.name == vm.api.fragments[0].fragment.name
                        && vm.api.fragments[0].parameters && vm.api.fragments[0].parameters.length > 0) {
                    vm.selectedFragment.parameters.forEach(function (s_parameter) {
                        if(s_parameter.key == 'apiScope'){
                            if(s_parameter.value) {
                                vm.existingScope = false;
                                vm.scopes.some(function(scope){
                                    if (scope.scope == s_parameter.value) {
                                        vm.existingScope = true;
                                    }
                                    return vm.existingScope;
                                });
                            }else vm.existingScope = true;
                        }
                        vm.api.fragments[0].parameters.forEach(function (parameter) {
                            if (s_parameter.key == parameter.key) {
                                s_parameter.value = parameter.value;
                                s_parameter.type = parameter.type;
                                s_parameter.label = parameter.label;
                                s_parameter.established = true;
                            }
                        });
                    });
                // 등록시 fragment 설정
                }else {
                    vm.selectedFragment.parameters = [];
                    vm.selectedFragment.arguments.forEach(function (s_argument) {
                        vm.selectedFragment.parameters.push({ // argument의 id 키를 제외하고, 나머지 키만 배열로 재구성한다.
                            key : s_argument.name,
                            label : s_argument.label,
                            type : s_argument.type,
                            value : s_argument.value
                        });
                    });
                }
            }
        }


        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function clearTopModal() {
            $uibModalStack.dismiss($uibModalStack.getTop().key);
        }

        function onSuccess(result) {
            if (result.status == 'UPDATING') {
                CommonUtil.onError('승인이 필요한 사항을 변경하셨습니다.<br/>승인요청을 진행하시기 바랍니다.');
            }
            $uibModalInstance.close(result);
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function closeTerm() {
            vm.isTermsOpen = false;
        }

        function closeBillingPolicy() {
            vm.isbillingPoliciesOpen = false;
        }

        // 팝업방식
        function showTermsContent() {
            if (vm.api.termsOfUse) {
                Api.getTermsContent({id: vm.api.termsOfUse.id}).$promise.then(function (response) {
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
                        loadAll();
                    });
                });
            }
        }

        function showBillingPolicies() {
            vm.isbillingPoliciesOpen = (vm.api.billingPolicy && vm.api.billingPolicy.id) ? true : false;
            if (vm.isbillingPoliciesOpen) {
                $uibModal.open({
                    templateUrl: 'app/services/common/billing-policy.html',
                    scope: $scope,
                    backdrop: 'static',
                    size: 'md'
                });
            }
            vm.billingPolicytooltipIsOpen = !vm.isbillingPoliciesOpen;
            if (vm.billingPolicytooltipIsOpen) {
                $timeout(function () {
                    vm.billingPolicytooltipIsOpen = false;
                }, 100);
            }
        }
    }
})();
