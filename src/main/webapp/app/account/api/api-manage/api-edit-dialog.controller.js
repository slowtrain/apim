(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('apiEditDialogController', apiEditDialogController);

    apiEditDialogController.$inject = ['CommonConstants', '$uibModalStack', '$compile', '$uibModalInstance', '$scope', '$uibModal', 'selectedApi', 'Api', 'Code', 'JhiLanguageService', 'apiPlans', 'Gateway', '$timeout', 'CommonUtil'];

    function apiEditDialogController(CommonConstants, $uibModalStack, $compile, $uibModalInstance, $scope, $uibModal, selectedApi, Api, Code, JhiLanguageService, apiPlans, Gateway, $timeout, CommonUtil) {

        var vm = this;
        var xsrf_token = CommonUtil.getCookie("XSRF-TOKEN");
        //신규 추가일 경우 초기값 설정
        vm.duplicateApi = duplicateApi;
        vm.newSpecFile = false;
        vm.delInput = CommonUtil.delInput;
        vm.selectFile = CommonUtil.selectFile;
        vm.deletion = false;

        vm.manualFiles = [{data:null}];
        vm.specFiles = [{data:null}];

        $scope.addFileInput = function(event, noAdd){
            var files = (noAdd)? vm.specFiles : vm.manualFiles;
            if (!vm.deletion) {
                var idx = event.target.id.split('-')[1];
                CommonUtil.addFileInput(idx, files, noAdd);
            }
        }

        var originalName;
        var originalUrl;

        if (selectedApi) {
            vm.mode = 'modify';
            vm.api = angular.copy(selectedApi);
            vm.termsOn = !!selectedApi.termsOfUse;
            originalName = selectedApi.name;
            originalUrl = selectedApi.urlPattern;
            if (vm.api.fragments && !!vm.api.fragments.length) {
                refreshFragment();
//                vm.selectedFragment = vm.api.fragments[0].fragment;
//                vm.selectedFragment.parameters = [];
//                vm.selectedFragment.parameters = vm.api.fragments[0].parameters;
//                changeFragment();
            }
        } else {
            vm.api = {isUpdatable: true, version: 1};
            vm.newSpecFile = true;
        }

        function duplicateApi() {
            vm.newSpecFile = true;
            originalName = null;
            originalUrl = null;
            vm.duplicatedName = true;
            vm.duplicatedUrl = true;
            vm.api = {
                    isUpdatable : true,
                    applicablePlans : vm.api.applicablePlans,
                    billingPolicy : vm.api.billingPolicy,
                    codeInjectionProtection : vm.api.codeInjectionProtection,
                    description : vm.api.description,
                    fragments : [{fragment: {id : vm.api.fragments[0].fragment.id}, parameters: vm.api.fragments[0].parameters}],
                    gatewayCluster : vm.api.gatewayCluster,
                    isPrivate : vm.api.isPrivate,
                    name : vm.api.name,
                    routingUrl : vm.api.routingUrl,
                    sqlInjectionProtection : vm.api.sqlInjectionProtection,
                    termsOfUse : vm.api.termsOfUse,
                    urlPattern : vm.api.urlPattern
            }
            vm.mode = 'register';
        }

        vm.authorities = ['ROLE_API_CREATE'];
        vm.changeGatewayCluster = changeGatewayCluster;
        vm.changeFragment = changeFragment;
        vm.refreshFragment = refreshFragment;
        vm.clear = clear;
        vm.clearTopModal = clearTopModal;
        vm.languages = null;
        vm.save = save;
        vm.plansLoad = plansLoad;
        vm.loadByOrg = loadByOrg;
        vm.billingPolicies = null;
        vm.applicationPlans = applicationPlans;
        vm.closeTerm = closeTerm;
        vm.closeBillingPolicy = closeBillingPolicy;
        vm.checkedAll = checkedAll;
        vm.deletePlans = deletePlans;
        vm.selectedPlans = (selectedApi)? vm.api.applicablePlans: [];
        vm.isOpen = false;
        vm.allSelect = false;
        vm.showTermsContent = showTermsContent;
        vm.termContent = "약관을 선택해주세요.";

        vm.showBillingPolicies = showBillingPolicies;
        vm.billingPolicytooltipIsOpen = false;
        vm.isbillingPoliciesOpen = false;
        vm.delFile = delFile;
        vm.loadAll = loadAll;
        vm.fileDown = fileDown;
        vm.checkManualFile = checkManualFile;
        vm.filter = filter;
        vm.keypressWatch = keypressWatch;
        vm.keyupWatch = keyupWatch;
        vm.messageLimitCheckSize = 20 * 1024;
        vm.toNumFormat = toNumFormat;

        if (!vm.api.fragments) vm.api.fragments = [];
        if (!vm.api.gatewayCluster) vm.api.gatewayCluster = [];

        // 수정 모드면
        vm.gatewayClusterDisabled = vm.api.gatewayCluster.length != 0;
        vm.fragmentDisabled = vm.api.fragments.length != 0;

        vm.loadAll();

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

        $scope.$watch(function () {
            return vm.api.name
        }, function () {
            if (vm.api.name) {
                if (originalName && vm.api.name != originalName || !originalName) {
                    Api.checkname({name: vm.api.name}).$promise.then(function (response) {
                        vm.duplicatedName = !response.isSuccess;
                        if (vm.duplicatedName) angular.element("#apiName").focus();
                    });
                }
            } else {
                vm.duplicatedName = false;
            }
        });
        $scope.$watch(function () {
            return vm.api.urlPattern
        }, function () {
            if (vm.api.urlPattern) {
                if (originalUrl && vm.api.urlPattern != originalUrl || !originalUrl && vm.api.urlPattern) {
                    Api.checkuri({uri: vm.api.urlPattern}).$promise.then(function (response) {
                        vm.duplicatedUrl = !response.isSuccess;
                        if (vm.duplicatedUrl) angular.element("#proxyURL").focus();
                    });
                }
            } else {
                vm.duplicatedUrl = false;
            }
        });

        function fileDown(file) {
            if ($scope.account) window.location = '/files/download/' + file.id;
        }

        function loadAll() {
            if (vm.api.id) {
                Api.apiById({id: vm.api.id}).$promise.then(function (response) {
                    vm.api = response;
                    scopesLoad();
                    plansLoad();
                    loadByOrg();
                    loadAuthenticationTypes();
                });
            } else {
                scopesLoad();
                plansLoad();
                loadByOrg();
                loadAuthenticationTypes();
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

        function delFile(file, index) {
            if (index >= 0) {
                vm.api.attachFileIds = null;
                vm.api.attachFileList.splice(index, 1);
            } else {
                vm.api.specFile = null;
                vm.api.specFileId = null;
                vm.newSpecFile = true;
            }
        }

        function saveData() {
            vm.api.applicablePlans = vm.selectedPlans;
            vm.api.requiredAuthentication = 'NONE';
            vm.api.requireSSL = true;
            vm.api.fragments[0].fragment = vm.selectedFragment;
            vm.api.fragments[0].fragment.arguments = null; // 서버 오류(detached entity) 방지

            vm.api.fragments[0].parameters = vm.selectedFragment.parameters;
            vm.api.fragments[0].parameters.forEach(function(param){
                if (param.key == 'message.size') param.value = numeral(param.value).value();
            });

            if (vm.api.attachFileList) {
                vm.api.attachFileList.forEach(function(list) {
                    vm.api.attachFileIds.push(list.id);
                });
            }

            // 수정작업시, Fragment 설정과 관련하여 이전내용과 비교한 결과를 서버로 보낸다.
            if (vm.mode == 'modify') {
                var oldFragment = angular.copy(selectedApi.fragments[0]);
                var newFragment = angular.copy(vm.api.fragments[0]);
                var keyDiffer; var valueDiffer;
                keyDiffer = (oldFragment.parameters.length != newFragment.parameters.length);
                if (!keyDiffer) {
                    oldFragment.parameters.forEach(function(oldParam){
                        keyDiffer = true;
                        newFragment.parameters.some(function(newParam){
                            if (oldParam.key == newParam.key) {
                                valueDiffer = (oldParam.value != newParam.value);
                                keyDiffer = false;
                            }
                            return valueDiffer;
                        });
                    });
                }
                var fragmentDiffer = valueDiffer || keyDiffer;
            }

            //서버 Update 작업시 오류를 유발하는 값을 조정한다.
            vm.api.attachFileList = null;
            vm.api.specFile = null;
            vm.api.termsOfUse = vm.termsOn? {id: vm.api.termsOfUse.id} : null;

            if (!vm.api.id) {
                Api.create(vm.api, onSuccess, onError);
            } else {
                Api.update({fragmentDiffer: fragmentDiffer}, vm.api, onSuccess, onError);
            }
        }

        function checkSSL () {
            return (vm.selectedFragment.name.indexOf("Inbound") > -1 && !vm.api.routingUrl.startsWith("https"));
        }

        function save(form) {
//            if (checkSSL()) {
//                CommonUtil.onError("Inbound 용도의 API 호출 URL은<br/>https로 시작해야 합니다.");
//                vm.invalidRequireSSL = true;
//                return;
//            } else vm.invalidRequireSSL = false;

            if ($('input[name=specFile]').val()) {
                var type = $('input[name=specFile]').val().substring($('input[name=specFile]').val().lastIndexOf('.') + 1).toUpperCase();
                if (type != "WADL" && type != "JSON" && type != "XML") {
                    CommonUtil.onError("API 명세서는 WADL, JSON, XML 파일만 가능합니다.");
                    return;
                }
                if(navigator.userAgent.indexOf('MSIE 9.0') <0 && $('input[name=specFile]')[0].files[0].size >= CommonConstants.attachFileSize) {
                    CommonUtil.onError("API 명세서 파일은 "+CommonUtil.fileSize({fileSize: CommonConstants.attachFileSize})+"를 넘을 수 없습니다.");
                    return;
                }
                $("#specFile").ajaxForm({
                    url: "/files/upload?_csrf=" + xsrf_token,
                    enctype: "multipart/form-data",
                    type: "post",
                    cache: "false",
                    dataType: "json",
                    data: {type: "SPEC"},
                    success: function (data) {
                        vm.api.specFileId = data;
                        gotoManualFile();
                        $scope.$apply();
                    },
                    error: function (error) {

                        //ie9의 경우 서버에서 에러메시지를 받지 못하므로 ui에서 일괄 표시한다.
                        if(navigator.userAgent.indexOf('MSIE 9.0')!==-1) {
                            CommonUtil.onError('API 명세서 파일을 다시 확인해 주십시오.');
                            return;
                        }
                        if(error.status == 500) CommonUtil.onError('API 명세서 파일을 다시 확인해 주십시오.');
                        else CommonUtil.onError("API 명세서<br/>"+ error.responseJSON.description);
                        return;
                    }
                });
                $("#specFile").submit();
            } else {
                vm.api.specFileId = (vm.api.specFile) ? vm.api.specFile.id : null;
                gotoManualFile();
            }
        }

        function checkManualFile() {
            vm.flagOfManual= false;
            vm.totalSize = 0;
            $('div[name=manualFile] > div[name=file-input] > input.file-input').each(function (idx) {
                if ($(this).val()) { //for문 안에서 모달/alert를 띄우면, 바탕모달이 닫혀버리는 에러발생 -- 따라서 사이즈오류 모달을 따로 작성함.
                    if(navigator.userAgent.indexOf('MSIE 9.0') <0 && $(this)[0].files[0].size >= CommonConstants.attachFileSize) vm.violationOfSize= true;
                    else {
                        vm.totalSize += $(this)[0].files[0].size;
                        vm.flagOfManual= true;
                    }
                }else $(this).attr('disabled', 'disabled'); //빈 input칸을 disable하지 않으면, ie9에서는 오류가 난다.
            });
        }

        function gotoManualFile() {
            checkManualFile();
            var removeAttr = function(){
                $('div[name=manualFile] > div[name=file-input] > input.file-input').each(function(idx){
                    $(this).removeAttr('disabled');
                });
            };
            if (vm.violationOfSize) {
                removeAttr();
                CommonUtil.onError("API설명서 파일은 각각 "+CommonUtil.fileSize({fileSize: CommonConstants.attachFileSize})+"를 넘을 수 없습니다.");
                vm.violationOfSize = false;
                return;
            }
            if (vm.totalSize > CommonConstants.totalFileSize) {
                CommonUtil.onError('설명서 업로드 파일의 총 용량은 '+CommonUtil.fileSize({fileSize: CommonConstants.totalFileSize})+'를 넘을 수 없습니다.');
                return;
            }
            if (vm.flagOfManual) {
                $("#manualFile").ajaxForm({
                    url: "/files/upload?_csrf=" + xsrf_token,
                    enctype: "multipart/form-data",
                    type: "post",
                    cache: "false",
                    dataType: "json",
                    data: {type: "api"},
                    success: function (data) {
                        vm.api.attachFileIds = data;
                        saveData();
                        $scope.$apply();
                    },
                    error: function (error) {
                        removeAttr();

                        //ie9의 경우 서버에서 에러메시지를 받지 못하므로 ui에서 일괄 표시한다.
                        if(navigator.userAgent.indexOf('MSIE 9.0')!==-1) {
                            CommonUtil.onError('API 설명서 파일을 다시 확인해 주십시오.');
                            return;
                        }
                        if(error.status == 500) CommonUtil.onError('API 설명서 파일을 다시 확인해 주십시오.');
                        else CommonUtil.onError("API 설명서<br/>"+ error.responseJSON.description);
                        return;
                    }
                });
                $("#manualFile").submit();
            } else {
                vm.api.attachFileIds = [];
                saveData();

                /*if (!vm.api.attachFileList || vm.api.attachFileList.length == 0) {
                    removeAttr();
                    CommonUtil.onError("API 설명서 파일은 필수입니다.<br/>다시 확인해 주십시오.");
                } else {
                    vm.api.attachFileIds = [];
                    saveData();
                }*/
            }
        }

        function plansLoad() {
            apiPlans.available().$promise.then(function (response) {
                vm.apiPlans = response;
                if (vm.selectedPlans.length==0) {
                    if (vm.apiPlans.length==1) {
                        vm.apiPlans[0].checked = true;
                        vm.apiPlans[0].isDisabled = true;
                        vm.selectedPlans = [vm.apiPlans[0]];
                    } else {
                        vm.apiPlans.forEach(function (plan) {
                            plan.checked = false;
                            plan.isDisabled = false;
                        });
                    }
                } else {
                    vm.apiPlans.forEach(function (original) {
                        original.checked = false;
                        original.isDisabled = false;
                        vm.selectedPlans.some(function (selected) {
                            if (original.id == selected.id) {
                                original.checked = true;
                                original.isDisabled = true;
                            }
                            return original.id == selected.id;
                        });
                    });
                }
                vm.applicationPlans();
            });
        }

        function checkedAll(checked) {
            vm.apiPlans.filter(function (plan) {
                return plan.isDisabled == false;
            }).forEach(function(plan){
                plan.checked = checked;
            });
        }

        function applicationPlans() {
            vm.selectedPlans = [];
            if (vm.mode != 'modify' && vm.apiPlans[0]) vm.apiPlans[0].checked = true;
            vm.apiPlans.filter(function (plan) {
                return plan.checked==true;
            }).forEach(function (plan) {
                vm.selectedPlans.push(plan);
                plan.isDisabled = true;
            });
            vm.isOpen = false;
        }

        function deletePlans(plan) {
            if (vm.selectedPlans.length <= 1) {
                vm.tooltipIsOpen = true;
                $timeout(function () {
                    vm.tooltipIsOpen = false;
                }, 100);
            } else {
                vm.selectedPlans.splice(vm.selectedPlans.indexOf(plan), 1);
                plan.checked = false;
                vm.allSelect = false;
                plan.isDisabled = false;
            }
        }

        function closeTerm() {
            vm.isTermsOpen = false;
        }

        function closeBillingPolicy() {
            vm.isbillingPoliciesOpen = false;
        }

        function loadByOrg() {
            Api.organization().$promise.then(function (response) { //현재 사용자의 기관정보
                vm.organization = response;
                termsLoad();
                billingPolicyLoad();
            });
        }

        function termsLoad() {
            if (vm.organization != null) {
                Api.termsByOrganization({id: vm.organization.id}).$promise.then(function (response) {
                    vm.terms = response;
                });
            }
        }

        function billingPolicyLoad() {
            if (vm.organization != null) {
                Api.billingPolicy({id: vm.organization.id}).$promise.then(function (response) {
                    vm.billingPolicies = response;
                });
            }
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

        function keypressWatch(event){
            if(event.keyCode == 45) {
                event.preventDefault();
            } //음수 부호 입력을 제한한다. 다른 기타 키입력은 numeral.js에서 걸러준다.
        }

        function keyupWatch(event, model){
            $scope.$watch(function(){
                model.value = numeral(model.value).value()==0? '0' : numeral(model.value).value() > vm.messageLimitCheckSize? numeral(vm.messageLimitCheckSize).format('0,0') : numeral(model.value).format('0,0');
            });
        }
    }
})();
