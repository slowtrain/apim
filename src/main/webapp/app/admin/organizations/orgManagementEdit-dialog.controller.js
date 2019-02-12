(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('OrgManagementEditDialogController', OrgManagementEditDialogController);

    OrgManagementEditDialogController.$inject = ['CommonConstants', '$scope', '$uibModal', '$uibModalInstance', 'selectOrg', 'Organization', 'User', 'CommonUtil', 'JhiLanguageService'];

    function OrgManagementEditDialogController(CommonConstants, $scope, $uibModal, $uibModalInstance, selectOrg, Organization, User, CommonUtil, JhiLanguageService) {
        var vm = this;

        vm.authorities = ['ROLE_ADMIN'];
        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.addWithdrawal = addWithdrawal;
        vm.delWithdrawal = delWithdrawal;
        vm.accountNumberSearch = accountNumberSearch;
        vm.getAccountNumber = getAccountNumber;
        vm.setDefaultWithdrawalAccount = setDefaultWithdrawalAccount;
        vm.setManager = setManager;
        vm.delUser = delUser;
        vm.addUsers = addUsers;
        vm.fileDown = fileDown;
        vm.fileSize = CommonUtil.fileSize;
        vm.deactivateInfo = deactivateInfo;
        vm.mainPhone = [];
        vm.licenseNumber = [];
        vm.corpRegNumber = [];

        vm.districtNums = CommonConstants.districtNums;
        vm.cellIdentifyingNums = CommonConstants.cellIdentifyingNums;

        vm.flagOfRegister = true;

        vm.delInput = CommonUtil.delInput;
        vm.selectFile = CommonUtil.selectFile;

        vm.init = init;
        vm.checkProvider = checkProvider;
        vm.checkBoxClickProvider = checkBoxClickProvider;
        vm.uploadFiles = uploadFiles;

        function fileDown(file) {
            if ($scope.account) window.location = '/files/download/' + file.id;
        }

        function checkProvider(org) {
            vm.providerChecked = false;
            vm.providers.forEach(function (p) {
                if (p.id == org.id) {
                    vm.providerChecked = true;
                    p.checked = true;
                } else p.checked = false;
            });
        }

        function checkBoxClickProvider() {
            vm.Org.code = angular.copy(vm.orgCode);
            vm.Org.gatewayDomainName = angular.copy(vm.orgGWDomainName);
            if (vm.flagOfRegister) vm.Org.orgWithdrawals = [];
        }

        function init() {

            vm.deletion = false;
            vm.files = [{data:null}];

            if (selectOrg != undefined) {
                vm.flagOfRegister = false;
                vm.mode = "edit";
                vm.Org = angular.copy(selectOrg);
                vm.Org.checkState = angular.copy(vm.Org.state);
                vm.Org.attachFileIds = [];
                vm.orgCode = angular.copy(vm.Org.code);
                vm.orgGWDomainName = angular.copy(vm.Org.gatewayDomainName);
                //getChangeSet(vm.Org.id);
                Organization.providers().$promise.then(function (response) {
                    vm.providers = response;
                    response.forEach(function (provider) {
                        provider.checked = false;
                        if (vm.Org.reservedProviders) {
                            vm.Org.reservedProviders.forEach(function (reserved) {
                                if (reserved.id == provider.id) {
                                    provider.checked = true;
                                    vm.providerChecked = true;
                                }
                            });
                        }
                    });
                });

                if (vm.Org.mainPhone) vm.Org.mainPhone.split('-').forEach(function(v, i){
                 vm.mainPhone[i] = v;
                 });

                if (vm.Org.licenseNumber) vm.Org.licenseNumber.split('-').forEach(function (v, i) {
                    vm.licenseNumber[i] = v;
                });
                if (vm.Org.corpRegNumber) vm.Org.corpRegNumber.split('-').forEach(function (v, i) {
                    vm.corpRegNumber[i] = v;
                });
                loadUsers();
            } else {
                vm.providers = Organization.providers();
                vm.mode = "register";
                vm.Org = {orgWithdrawals: [], attachFileIds: []};
            }
        }

        vm.init();

        $scope.addFileInput = function(event, noAdd){
            if (!vm.deletion){
                var idx = event.target.id.split('-')[1];
                CommonUtil.addFileInput(idx, vm.files, noAdd);
            }
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
                };
                Organization.checkWithdrawalAccountUsed({accountNumber: vm.newW.accountNumber}, addAllow, onError);
            }
        }

        function getChangeSet(id) {
            Organization.changeSet({id: id}).$promise.then(function (response) {
                vm.changeSets = response.changeSets;
            });
        }

        function loadUsers() {
            Organization.usersForAdmin({orgId: vm.Org.id}).$promise.then(function (response) {
                vm.originalUsers = angular.copy(response);
                vm.users = response;
                vm.users.forEach(function (user, i) {
                    if (user.manager) vm.manager = user;
                });
            });
            User.listAllForAdmin().$promise.then(function (response) {
                vm.availableUsers = response.filter(function (user) {
                    return user.organization == null
                        && user.authorities.indexOf('ROLE_ADMIN') < 0
                        && user.authorities.indexOf('ROLE_MANAGER') < 0
                });
            });
        }

        function addUsers() {
            if (!vm.availableUsers || vm.availableUsers.length == 0) {
                CommonUtil.onError("현재 추가 가능한 사용자가 없습니다.");
            } else {
                var name = vm.Org.name + " : 사용자 추가";
                $uibModal.open({
                    templateUrl: 'app/services/common/select-modal.html',
                    controller: 'selectModalController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        items: function () {
                            return {
                                data: {
                                    name: name,
                                    availableUsers: vm.availableUsers
                                },
                                category: 'orgAddUsers',
                                type: 'orgAddUsers'
                            }
                        }
                    }
                }).result.then(function (result) {
                    if (result != 'cancel') {
                        insertUsers(result.orgUsers);
                    }
                })
            }
        }

        function insertUsers(users) {
            users.forEach(function (user, i) {
                vm.users.push(user);
                vm.availableUsers.splice(vm.availableUsers.indexOf(user), 1);
            });
        }

        function delUser(user, idx) {
            var name = "[ " + user.fullName + " ]" + " : 선택하신 user를";
            var func = function (result) {
                vm.users.splice(idx, 1);
                vm.availableUsers.push(user);
            };
            CommonUtil.deleteModal(name, func);
        }

        function setManager(user) {
            vm.users.forEach(function (user) {
                user.isManager = false;
            });
            user.isManager = true;
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function onSuccess(result) {
            $uibModalInstance.close(result);
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function deactivateInfo() {
            var func = function (result) {
                if (result) vm.Org.checkState = 'INACTIVE';
                else vm.Org.checkState = 'ACTIVE';
            };
            CommonUtil.onError("해당기관이 가진 API, APP의 상태도<br/>비활성화 됩니다.<br/>그래도 비활성화 하시겠습니까?", 'sm', 'orgDeactivate', func, "비활성 처리 안내");
        }

        /* 현재 모달창 안에서는 아래 기능을 사용 안 함
        function checkStateBeforeSave() {
            if (!vm.flagOfRegister && (selectOrg.state != vm.Org.checkState)) {
                if (vm.Org.checkState == 'ACTIVE') Organization.activateForAdmin({orgId: vm.Org.id, mode: 'activate'}, uploadFiles, onError);
                else Organization.activateForAdmin({orgId: vm.Org.id, mode: 'deactivate'}, uploadFiles, onError);
            } else uploadFiles();
        }*/

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
                        save();
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
            } else save();
        }


        function save() {
            if (vm.Org.attachFileList) {
                vm.Org.attachFileList.forEach(function(file, i){
                    vm.Org.attachFileIds.push(file.id);
                });
            }
            vm.Org.licenseNumber = (vm.licenseNumber.length == '3') ? vm.licenseNumber.join('-') : null;
            vm.Org.corpRegNumber = (vm.corpRegNumber.length == '2') ? vm.corpRegNumber.join('-') : null;
            vm.Org.mainPhone = (vm.mainPhone.length == '3') ? vm.mainPhone.join('-') : null;

            /*if (vm.modifyMainPhone || vm.flagOfRegister) {
                vm.Org.mainPhone = (vm.mainPhone.length == '3') ? vm.mainPhone.join('-') : null;
            }*/
            /*if (vm.modifyWithdrawalAccountNumber || vm.flagOfRegister) {
                vm.Org.withdrawalAccountNumber = vm.withdrawalAccountNumber;
            }*/

            if (vm.Org.type == 'PROVIDER') {
                vm.Org.orgWithdrawals = [];
            } else {
                vm.Org.reservedProviders = vm.providers.filter(function (org) {
                    return org.checked == true;
                });
            }

            if (!vm.Org.id) {
                Organization.createForAdmin(vm.Org, function() { onSuccess('create') }, onError);
            } else {
                /*vm.Org.apiPlans = vm.Org.apiPlans.map(function(plan){
                 return {id: plan.id}
                 });*/
                vm.Org.attachFileList = [];


                /*var flag = '';
                vm.users.forEach(function (user, i) {
                    flag = true;
                    vm.originalUsers.some(function (original) {
                        if (user.id == original.id) flag = false;
                        return user.id == original.id;
                    });
                    if (flag) {
                        User.moveUserForAdmin({organizationId: vm.Org.id, userId: user.id});
                    }
                });
                vm.originalUsers.forEach(function (original, i) {
                    flag = true;
                    vm.users.some(function (user) {
                        if (user.id == original.id) flag = false;
                        return user.id == original.id;
                    });
                    if (flag) {
                        User.moveUserForAdmin({userId: original.id});
                    }
                });*/

                // 관리자 지정하기 호출
                vm.users.filter(function (user) {
                    return user.isManager;
                }).forEach(function (user) {
                    Organization.setManagerForAdmin({orgId: vm.Org.id, userId: user.id});
                });

                // 기본 계좌 지정하기
                /*vm.Org.orgWithdrawals.filter(function (withdrawal) {
                    return withdrawal.isDefault;
                }).forEach(function (withdrawal) {
                    Organization.setDefaultWithdrawalAccount({orgId: vm.Org.id, withdrawalId: withdrawal.id}, finalSave, onError)
                });*/
                finalSave();
            }
        }

        function finalSave() {
         // circular: organizaton -> apiPlan -> organization -> apiPlan...
            if (vm.Org.apiPlans) {
                vm.Org.apiPlans.forEach(function (apiPlan) {
                    delete apiPlan.organization;
                });
            }
            Organization.updateForAdmin(vm.Org, function() { onSuccess('update') }, onError);
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
