(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('OrgSettingController', OrgSettingController);

    OrgSettingController.$inject = ['CommonConstants', '$scope', 'selectedOrg', 'User', '$state', '$uibModal', '$uibModalStack', '$uibModalInstance', 'Principal', 'CommonUtil', 'Organization'];

    function OrgSettingController (CommonConstants, $scope, selectedOrg, User, $state, $uibModal, $uibModalStack, $uibModalInstance, Principal, CommonUtil, Organization) {
        var vm = this;

        vm.user = Principal.identity();
        vm.requestApproval = requestApproval;
        vm.save = save;
        vm.clear = clear;
        vm.showDetail = showDetail;
        vm.addWithdrawal = addWithdrawal;
        vm.delWithdrawal = delWithdrawal;
        vm.accountNumberSearch = accountNumberSearch;
        vm.getAccountNumber = getAccountNumber;
        vm.setDefaultWithdrawalAccount = setDefaultWithdrawalAccount;
        vm.rollback = rollback;
        vm.fileDown = fileDown;
        vm.fileSize = CommonUtil.fileSize;
        vm.mainPhone = [];
        vm.licenseNumber = [];
        vm.corpRegNumber = [];
        vm.districtNums = CommonConstants.districtNums;
        vm.cellIdentifyingNums = CommonConstants.cellIdentifyingNums;
        vm.delInput = CommonUtil.delInput;
        vm.selectFile = CommonUtil.selectFile;

        function init() {
//            vm.modifyMainPhone = false;
            vm.deletion = false;
            vm.files = [{data:null}];

            if (typeof selectedOrg === 'object') {
                vm.Org = selectedOrg;
                vm.Org.attachFileIds = [];
                getChangeSet(vm.Org.id);
                return;
            }
            Organization.searchOrganization().$promise.then(function (response){
                vm.Org = response;
                vm.Org.attachFileIds = [];

                if (vm.Org.licenseNumber) vm.Org.licenseNumber.split('-').forEach(function (v, i) {
                    vm.licenseNumber[i] = v;
                });
                if (vm.Org.corpRegNumber) vm.Org.corpRegNumber.split('-').forEach(function (v, i) {
                    vm.corpRegNumber[i] = v;
                });
                if (vm.Org.mainPhone) vm.Org.mainPhone.split('-').forEach(function (v, i) {
                    vm.mainPhone[i] = v;
                });
                if (vm.Org.state=='UPDATING') CommonUtil.onError('승인이 필요한 사항이 있습니다.<br/>승인요청을 진행하시기 바랍니다.');
                getChangeSet(vm.Org.id);
                //loadUsers();
                /*Organization.providers().$promise.then(function (response) {
                    vm.providers = response;
                    response.forEach(function (provider) {
                        provider.checked = false;
                        if (vm.Org.reservedProviders) {
                            vm.Org.reservedProviders.forEach(function (reserved) {
                                if (reserved.id == provider.id) provider.checked = true;
                            });
                        }
                    });
                });*/

                vm.detailTitle = (vm.Org.state=='APPROVING' || vm.Org.state=='UPDATING' || vm.Org.state=='UPDATING_DENIED')? '변경요청 내용' : '상세보기';

                vm.alertSentences =
                    (vm.Org.state=='APPROVING')?
                            "<p class='mb_5'>· 수정하신 기관정보에 대해 승인진행 중입니다.</p><p>· 승인이 완료되기 전까지는 <strong class='color_red'>추가 수정이 불가능</strong>합니다.</p>" :
                    (vm.Org.state=='UPDATING')?
                            "<p class='mb_5'>· 승인이 필요한 사항이 있습니다.</p><p>· <strong class='color_red'>승인요청</strong>을 진행하시기 바랍니다.</p>" :
                    (vm.Org.state=='UPDATING_DENIED')?
                            "<p class='mb_5'>· 요청하신 승인건이 <strong class='color_red'>반려된 상태</strong>입니다.</p><p>· <strong>롤백</strong>을 하시거나 또는 아래 양식에서 <strong>재수정하여 승인요청을 진행</strong>하시기 바랍니다.</p>" : null;
            });
        }
        init();

        $scope.addFileInput = function(event, noAdd){
            if (!vm.deletion){
                var idx = event.target.id.split('-')[1];
                CommonUtil.addFileInput(idx, vm.files, noAdd);
            }
        }

        function rollback() {
            var param = {
                    message : "승인받지 못한 수정사항을<br/>원래 정보로 롤백하시겠습니까?<br/><br/>'예'를 선택하여 롤백하면,<br/>[변경요청 내용]창에서 변경요청내용이 삭제됩니다.<br/>------------------------------------------------<br/>다시 수정하여 승인을 재요청하시려면<br/>'아니오'를 누르십시오.",
                    title : "롤백 확인",
                    button : {
                        text1 : "예",
                        text2 : "아니오"
                    },
                    callback : function(result) {
                        if (result) Organization.deleteLatestHistory({}, onSuccessRollback, onError);
                    }
            }
            CommonUtil.modalTwo(param);
        }

        function onSuccessRollback() {
            CommonUtil.onError('롤백이 완료되었습니다.');
            init();
        }

        function getChangeSet(id) {
            Organization.changeSet({id: id}).$promise.then(function (response) {
                vm.changeSets = response.changeSets;
            });
        }

        function showDetail() {
            $uibModal.open({
                templateUrl: 'app/account/settings/org-setting/org-detail-view.html',
                scope: $scope,
                backdrop: 'static',
                size: 'md'
            });
        }

        function clear () {
            $uibModalStack.dismissAll();
        }

        function requestApproval() {
            $uibModal.open({
                templateUrl: 'app/services/common/request-approval.html',
                controller: 'ReqApprovalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selection: {
                        data: vm.Org,
                        type: "org"
                    }
                }
            }).result.then(function (result) {
                var params = {
                        title : '승인요청 확인',
                        message : result.description,
                        callback : init
                };
                CommonUtil.modalOne(params);
            });
        }

        function onSuccess() {
            init();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function fileDown(file) {
            if ($scope.account) window.location = '/files/download/' + file.id;
        }

        function delWithdrawal(withdrawal) {
            var delAllow = function() { vm.Org.orgWithdrawals.splice(vm.Org.orgWithdrawals.indexOf(withdrawal), 1); };

            if (!withdrawal.id) delAllow();
            else {
                Organization.checkWithdrawalAccountUsed({withdrawalId: withdrawal.id}, delAllow, onError);
            }
        }

        function addWithdrawal() {
            var duplicates = vm.Org.orgWithdrawals.filter(function(ow) {
                return ow.accountAlias == vm.newW.accountAlias || ow.accountNumber == vm.newW.accountNumber;
            });
            if (duplicates.length > 0) CommonUtil.modalOne("계좌별칭 또는 계좌번호가 중복됩니다.");
            else {
                var addAllow = function() {
                    vm.newW.isDefault = vm.Org.orgWithdrawals.length == 0;
                    vm.Org.orgWithdrawals.push(vm.newW);
                    vm.newW = null;
                    //CommonUtil.modalOne("추가된 계좌의 통장사본을<br/>스캔하여 업로드하시기 바랍니다.");
                };
                Organization.checkWithdrawalAccountUsed({accountNumber: vm.newW.accountNumber}, addAllow, onError);
            }
        }

        function save() {
            var param = {
                    message : "이전에 수정 · 저장하신 내용이 있다면,<br/>지금 저장하는 최신정보로 덮어쓰기 됩니다.<br/><br/>그래도 저장하시겠습니까?",
                    title : "저장 확인",
                    button : {
                        text1 : "예",
                        text2 : "아니오"
                    },
                    callback : function(result) {
                        if(result) uploadFiles();
                    }
            }
            CommonUtil.modalTwo(param);
        }

        function uploadFiles() {
            var flag = false;
            $('input[type=file].file-input').each(function(idx){
                if($(this).val()) {
                    if(navigator.userAgent.indexOf('MSIE 9.0') <0 && $(this)[0].files[0].size >= CommonConstants.attachFileSize) vm.violationOfSize= true;
                    else flag= true;
                }
                else $(this).attr('disabled', 'disabled');
            });

            if (vm.violationOfSize) {
                $('input[type=file].file-input').each(function (idx) {
                    $(this).removeAttr('disabled');
                });
                CommonUtil.onError("파일사이즈는 "+CommonUtil.fileSize({fileSize: CommonConstants.attachFileSize})+"를 넘을 수 없습니다.");
                vm.violationOfSize = false;
                return;
            }

            var xsrf_token = CommonUtil.getCookie("XSRF-TOKEN");

            if (flag) {
                $("#fileForm").ajaxForm({
                    url: "/files/account_register/upload?_csrf=" + xsrf_token,
                    enctype: "multipart/form-data",
                    type: "post",
                    dataType: "json",
                    data: {type: "organization"},
                    success: function (data) {
                        vm.Org.attachFileIds = data;
                        updateOrg();
                        $scope.$apply();
                    },
                    error: function (error) {
                        $('input[type=file].file-input').each(function (idx) {
                            $(this).removeAttr('disabled');
                        });
                        //ie9의 경우 서버에서 에러메시지를 받지 못하므로 ui에서 일괄 표시한다.
                        if(navigator.userAgent.indexOf('MSIE 9.0')!==-1) {
                            CommonUtil.onError('업로드 대상 파일을 다시 확인해 주십시오.');
                            return;
                        }
                        if(error.status == 500) CommonUtil.onError('업로드 대상 파일을 다시 확인해 주십시오.');
                        else CommonUtil.onError(error.responseJSON.description);
                        return;
                    }
                });
                $("#fileForm").submit();
            } else updateOrg();
        }

        function updateOrg() {
            vm.Org.attachFileList.forEach(function(file, i){
                vm.Org.attachFileIds.push(file.id);
            });
            vm.Org.licenseNumber = (vm.licenseNumber.length == '3') ? vm.licenseNumber.join('-') : null;
            vm.Org.corpRegNumber = (vm.corpRegNumber.length == '2') ? vm.corpRegNumber.join('-') : null;
            vm.Org.mainPhone = (vm.mainPhone.length == '3') ? vm.mainPhone.join('-') : null;

            /*if (vm.modifyMainPhone) {
                vm.Org.mainPhone = (vm.mainPhone.length == '3') ? vm.mainPhone.join('-') : null;
            }*/
            /*if (vm.modifyWithdrawalAccountNumber) {
                vm.Org.withdrawalAccountNumber = vm.withdrawalAccountNumber;
            }*/
            /*vm.Org.reservedProviders = vm.providers.filter(function (org) {
                return org.checked == true;
            });*/

            vm.Org.attachFileList = [];

            // 기본 계좌 지정하기
            /*vm.Org.orgWithdrawals.filter(function (withdrawal) {
                return withdrawal.isDefault;
            }).forEach(function (withdrawal) {
                Organization.setDefaultWithdrawalAccount({orgId: vm.Org.id, withdrawalId: withdrawal.id})
            });*/

            // circular: organizaton -> apiPlan -> organization -> apiPlan...
            if (vm.Org.apiPlans) {
                vm.Org.apiPlans.forEach(function (apiPlan) {
                    delete apiPlan.organization;
                });
            }
            Organization.updateOrganization(vm.Org, init, onError);
        }

        vm.lengthCheck = lengthCheck;
        function lengthCheck(type, val) {
            vm.licenseNumberLength = [];
            vm.corpRegNumberLength = [];
            vm.mainPhoneLength = [];
            vm.lengthChecked = false;

            val.forEach(function (n) {
                if (type == 'licenseNumber') {
                    if (n) vm.licenseNumberLength.push(n);
                } else if (type == 'corpRegNumber') {
                    if (n) vm.corpRegNumberLength.push(n);
                } else if (type == 'mainPhone') {
                    if (n) vm.mainPhoneLength.push(n);
                }
            });
            if (vm.licenseNumberLength.length == 1 || vm.licenseNumberLength.length == 2) vm.lengthChecked = true;
            if (vm.corpRegNumberLength.length == 1) vm.lengthChecked = true;
            if (vm.mainPhoneLength.length == 1 || vm.mainPhoneLength.length == 2) vm.lengthChecked = true;
        }

        vm.accountNumberPopover = {
                templateUrl: 'app/layouts/popover-template/account-number-popover.html'
        };

        function getAccountNumber(withdrawal) {
            /*if (!vm.loginPassword || vm.loginPassword.trim() =='') {
                vm.tooltipIsOpen = true;
                $('#loginPassword').focus();
                return;
            }*/
            var params = {
                withdrawalId:withdrawal.id,
                password: vm.loginPassword,
                history: withdrawal.history? withdrawal.history : false
            }
            Organization.getAccountNumber(params, function(result){
                vm.thisAccountNumber = result.accountNumber;
                vm.loginPassword = null;
                vm.initSearch = false;
            }, function(error) { withdrawal.isOpen = false; onError(error); });
        }

        function accountNumberSearch(withdrawal) {
            vm.initSearch = true;
            vm.loginPassword = '';
            getAccountNumber(withdrawal);
        }

        function setDefaultWithdrawalAccount(withdrawal) {
            vm.Org.orgWithdrawals.forEach(function (w) {
                w.isDefault = false;
            });
            withdrawal.isDefault = true;
        }
    }
})();
