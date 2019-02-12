(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('RegisterController', RegisterController);


    RegisterController.$inject = ['GeneralInfo', '$interval', 'CommonConstants', '$compile', '$state', '$scope', '$location', '$translate', 'CommonUtil', '$timeout', 'Auth', 'Organization', 'Register'];

    function RegisterController(GeneralInfo, $interval, CommonConstants, $compile, $state, $scope, $location, $translate, CommonUtil, $timeout, Auth, Organization, Register) {
        var vm = this;

        vm.register = register;
        vm.checkActivateKey = checkActivateKey;
        vm.secondaryAuth = secondaryAuth;
        vm.secondaryAuthCheck = secondaryAuthCheck;
        vm.checkingDuplication = checkingDuplication;
        vm.checkProvider = checkProvider;
        vm.addWithdrawal = addWithdrawal;
        vm.delWithdrawal = delWithdrawal;
        vm.setDefaultWithdrawalAccount = setDefaultWithdrawalAccount;

        vm.registerAccount = {};
        vm.email = [];
        vm.licenseNumber = [];
        vm.corpRegNumber = [];
        vm.mainPhone = [];
        vm.cellPhone = [];
        vm.orgMainPhone = [];
        vm.searchResult = false;
        vm.readOnly = false;
        vm.providers = Organization.providers();

        vm.searchResultPopup = searchResultPopup;
        vm.domainOptions = ['gmail.com', 'naver.com', 'daum.net', 'hanmail.net'];
        vm.districtNums = CommonConstants.districtNums;
        vm.cellIdentifyingNums = CommonConstants.cellIdentifyingNums;
        vm.passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[~!@#$%^&*\-_+=|\\]).{8,20}$/;

        vm.delInput = CommonUtil.delInput;
        vm.selectFile = CommonUtil.selectFile;
        vm.deletion = false;
        vm.files = [{data:null}];

        $scope.addFileInput = function(event, noAdd){
            if (!vm.deletion){
                var idx = event.target.id.split('-')[1];
                CommonUtil.addFileInput(idx, vm.files, noAdd);
            }
        }

        var init = {
            showTerms: {
                forUsers: function (id) {
                    id = '#portalTermsForUsers' + id;
                    GeneralInfo.allContents({kind: 'portal-terms', useYn:'Y'}).$promise.then(function (response) {
                        $(id).html(response[0].contentsBody);
                    });
                },
                /*forOrgs: function () {
                    var id = '#portalTermsForOrgs';
                    PortalTerms.showTermsForRegister({type: 'ORGANIZATION'}).$promise.then(function (response) {
                        $(id).html(response.contents);
                    });
                }*/
            },
            showAgreeform: function (id) {
                id = '#agreeformForUsers' + id;
                GeneralInfo.allContents({kind: 'privacy-policy', useYn:'Y'}).$promise.then(function (response) {
                    $(id).html(response[0].contentsBody);
                });
            },
            afterSearch: function () {
                vm.email = [];
                vm.cellPhone = [];
                vm.mainPhone = [];
                vm.corpRegNumber = [];
                vm.confirmPassword = '';
                vm.authNumber = '';
            },
            captcha: function (arg) {
                changeCaptcha(arg);
                var id = '#reLoad' + arg;
                $(id).click(function () {
                    changeCaptcha(arg)
                });
            },
            afterRegister: function () {
                vm.registerAccount = {};
                vm.newW = null;
                $('input').each(function () {
                    $(this).val('');
                });
                vm.files = [{data:null}];
                vm.isSecondAuthRequested = false;
                vm.authSuccess = false;
                vm.searchResult = false;
                vm.registerNewOrg = false;
                vm.readOnly = false;
                vm.agreeToPortalTermsForUsers = false;
                //vm.agreeToPortalTermsForOrgs = false;
                vm.agreeToAgreeform = false;
                vm.licenseNumber = [];
                vm.email = [];
                vm.cellPhone = [];
                vm.mainPhone = [];
                vm.corpRegNumber = [];
                vm.confirmPassword = '';
                vm.authNumber = '';
                vm.providers = Organization.providers();
            }
        };
        vm.init = init;
        vm.init.showTerms.forUsers(1);
        vm.init.showAgreeform(1);

        function delWithdrawal(withdrawal) {
            vm.registerAccount.organization.orgWithdrawals.splice(vm.registerAccount.organization.orgWithdrawals.indexOf(withdrawal), 1);
        }

        function addWithdrawal() {
            var duplicates = vm.registerAccount.organization.orgWithdrawals.filter(function(ow) {
                return ow.accountAlias == vm.newW.accountAlias || ow.accountNumber == vm.newW.accountNumber;
            });
            if (duplicates.length > 0) CommonUtil.modalOne("계좌별칭 또는 계좌번호가 중복됩니다.");
            else {
                var addAllow = function() {
                    vm.newW.isDefault = vm.registerAccount.organization.orgWithdrawals.length == 0;
                    vm.registerAccount.organization.orgWithdrawals.push(vm.newW);
                    vm.newW = null;
                };
                Organization.checkWithdrawalAccountUsed({accountNumber: vm.newW.accountNumber}, addAllow, onError);
            }
        }

        function setDefaultWithdrawalAccount(withdrawal) {
            vm.registerAccount.organization.orgWithdrawals.forEach(function (w) {
                w.isDefault = false;
            });
            withdrawal.isDefault = true;
        }

        function checkingDuplication(arg) {
            if (arg =='userId') {
                vm.userIdSuccess = true;
            }
            else {
                vm.emailSuccess = true;
            }
        }

        function secondaryAuth() {
            vm.email[1] = (!vm.email[1]) ? 'shinhan.com' : vm.email[1];
            var licenseNumber = vm.registerNewOrg? vm.licenseNumber.join('-') : null;
            var corpRegNumber = vm.registerNewOrg? vm.corpRegNumber.join('-') : null;
            var orgName = vm.registerNewOrg? vm.registerAccount.organization.name : null;
            if (vm.registerAccount.password.match(/\s/g)) {
                CommonUtil.onError("비밀번호에 공백이 들어있습니다.");
                vm.registerAccount.password = null;
                vm.confirmPassword = null;
                return;
            }
            Register.secondaryAuth({
                login: vm.registerAccount.login,
                email: vm.email.join('@'),
                cellPhone: vm.cellPhone.join('-'),
                licenseNumber: licenseNumber,
                corpRegNumber: corpRegNumber,
                orgName: orgName
                }).$promise.then(function() {
                    vm.isSecondAuthRequested = true;
                    $timeout(function(){ $('input[name=authNumber]').focus();});
                    secondCheck();
//                    secondaryAuthCheck(); // SMS 인증 불가환경으로 인해 추가
                }).catch(function (error) {
                    vm.authNumber = '';
                    CommonUtil.onError(error.data.description);
                });
        }

        function secondaryAuthCheck() {
//            vm.authNumber = '1111'; // SMS 인증 불가환경으로 인해 추가
            Register.secondaryAuthCheck({
                cellPhone: vm.cellPhone.join('-'),
                authNumber: vm.authNumber
                }).$promise.then(function() {
                    vm.isSecondAuthRequested = true;
                    vm.authSuccess = true;
//                    vm.register(); // SMS 인증 불가환경으로 인해 추가
                }).catch(function (error) {
                    vm.authNumber = '';
                    $('input[name=authNumber]').focus();
                    vm.authSuccess = false;
                    CommonUtil.onError(error.data.description);
                });
        }

        function secondCheck() {
            vm.msecPerMinute = 3000 * 60;
            vm.msecPerSecond = 1000;
            var interval = $interval(function () {
                vm.msecPerMinute = vm.msecPerMinute - vm.msecPerSecond;
                if (vm.msecPerMinute <= 0) {
                    vm.isSecondAuthRequested = false;
                    $interval.cancel(interval);
                }
                if (vm.authSuccess) $interval.cancel(interval);
            }, 1000);
        }

        function checkActivateKey() {
            Auth.checkActivateKey({key: vm.activateKey}).then(function (response) {
                $state.go('activate', {key: vm.activateKey});
            }).catch(checkActivateKeyNO);
        }

        function checkActivateKeyNO() {
            CommonUtil.onError("인증번호를 다시 확인해주세요.");
        }

        function searchResultPopup() {
            vm.searchResult = false;
            Organization.search({licenseNumber: vm.licenseNumber.join("-")}).$promise.then(function (response) {
                if (response.length) {
                    if (response[0].type == 'PROVIDER' || response[0].state == 'INACTIVE') CommonUtil.onError('사용할 수 없는 번호입니다.');
                    else {
                        vm.searchResult = true;
                        vm.readOnly = true;
                        $timeout(function () {
                            init.captcha(2)
                        });
                        vm.registerAccount.organization = response[0];
                        vm.init.showTerms.forUsers(2);
                        vm.init.showAgreeform(2);
                    }
                } else {
                    var customfunc = function (result) {
                        if (result) {
                            vm.registerAccount = {licenseNumber: vm.registerAccount.licenseNumber, organization: {orgWithdrawals:[]}};
                            vm.searchResult = false;
                            vm.registerNewOrg = true;
                            vm.readOnly = true;
                            init.afterSearch();
                            $timeout(function () {
                                init.captcha(3);
                            });
                            vm.init.showTerms.forUsers(2);
                            vm.init.showAgreeform(2);
                        }
                    };
                    CommonUtil.onError("새로운 기관을 등록하시겠습니까?<br/>재검색을 하시려면 아니오를 누르세요.", 'sm', 'searchResult', customfunc);
                }
            });
        }

        function changeCaptcha(choice) {
            var rand = Math.random(); // IE 11 미만에서는 crypto가 불가능하므로, 그대로 Math.random을 사용한다.
            var id = '#captcha' + choice;
            $(id).html('<img src="/api/captcha?rand=' + rand + '"/>');
        }

        $(document).ready(function () {
            $timeout(function () {
                init.captcha(1)
            });
        });


        function register() {

            vm.registerAccount.organization.attachFileIds = [];
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
                        vm.registerAccount.organization.attachFileIds = data;
                        create();
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
            } else create();
        }

        function initInput(){
            $("input[type=file]").each(function(idx){
                if($(this).attr('id') != $("input[type=file]").last().attr('id')) $(this).parent().remove();
            });
        }

        function onSuccess(response) {
            var func = function (result) {
                $state.go('home');
                CommonUtil.scrollTop();
            };
            CommonUtil.onError(response.description, 'sm', 'register', func);
//            if (response.redirect) {
//                // 이메일을 사용하지 않는 경우에는 내려받는 주소로 페이지를 이동한다.
//                location.replace(response.redirect);
//            } else {
//                var func = function (result) {
//                    $state.go('home')
//                };
//                CommonUtil.onError("가입인증을 위해 이메일을 확인하십시오.", 'sm', 'register', func);
//                vm.providers = Organization.providers();
//                if (vm.registerNewOrg) changeCaptcha(3);
//                else if (vm.searchResult) changeCaptcha(2);
//                else changeCaptcha(1);
//                init.afterRegister();
//            }
        }

        function onError(error) {
            var customfunc = function (result) {
                vm.registerAccount.answer = "";
                if (vm.registerNewOrg) changeCaptcha(3);
                else if (vm.searchResult) changeCaptcha(2);
                else changeCaptcha(1);
            };
            CommonUtil.onError(error.data.description, 'sm', 'changeCaptcha', customfunc);
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


        function create() {
            vm.registerAccount.langKey = $translate.use();
            if (vm.registerNewOrg) {
                vm.registerAccount.organization.reservedProviders = vm.providers.filter(function (org) {
                    return org.checked == true;
                });
                vm.registerAccount.email = vm.email.join("@");
                vm.registerAccount.organization.type = 'PARTNER';
                vm.registerAccount.organization.licenseNumber = (vm.licenseNumber.length == '3') ? vm.licenseNumber.join('-') : null;
                vm.registerAccount.organization.corpRegNumber = (vm.corpRegNumber.length == '2') ? vm.corpRegNumber.join('-') : null;
                vm.registerAccount.organization.mainPhone = (vm.orgMainPhone.length == '3') ? vm.orgMainPhone.join('-') : null;
                vm.registerAccount.mainPhone = (vm.mainPhone.length == '3') ? vm.mainPhone.join('-') : null;
                vm.registerAccount.cellPhone = (vm.cellPhone.length == '3') ? vm.cellPhone.join('-') : null;

                Register.saveWithOrg(vm.registerAccount, onSuccess, function(error){
                    /*vm.authNumber = '';
                    vm.authSuccess = false;
                    vm.isSecondAuthRequested = false;*/
                    CommonUtil.onError(error.data.description);
                    $state.reload(); // 예기치 않은 오류로 관심API 제공기관정보가 누락된 상황이므로, 새로고침한다.
                });
            } else {
                vm.email[1] = (!vm.email[1]) ? 'shinhan.com' : vm.email[1];
                vm.registerAccount.email = vm.email.join("@");
                vm.registerAccount.mainPhone = (vm.mainPhone.length == '3') ? vm.mainPhone.join('-') : null;
                vm.registerAccount.cellPhone = (vm.cellPhone.length == '3') ? vm.cellPhone.join('-') : null;
                Register.save(vm.registerAccount, onSuccess, function(error){
                    /*vm.authNumber = '';
                    vm.authSuccess = false;
                    vm.isSecondAuthRequested = false;*/
                    CommonUtil.onError(error.data.description);
                    $state.reload(); // 예기치 않은 오류로 관심API 제공기관정보가 누락된 상황이므로, 새로고침한다.
                });
            }
        }

        vm.lengthCheck = lengthCheck;
        function lengthCheck(type, val) {
            vm.corpRegNumberLength = [];
            vm.mainPhoneLength = [];
            vm.licenseNumberLength = [];
            vm.emailLength = [];
            vm.lengthChecked = false;

            val.forEach(function (n) {
                if (type == 'corpRegNumber') {
                    if (n) vm.corpRegNumberLength.push(n);
                } else if (type == 'mainPhone') {
                    if (n) vm.mainPhoneLength.push(n);
                } else if (type == 'licenseNumber') {
                    if (n) vm.licenseNumberLength.push(n);
                } else if (type == 'email') {
                    if (n) vm.emailLength.push(n);
                }
            });
            if (vm.corpRegNumberLength.length == 1) vm.lengthChecked = true;
            if (vm.emailLength.length == 1) vm.lengthChecked = true;
            if (vm.mainPhoneLength.length == 1 || vm.mainPhoneLength.length == 2) vm.lengthChecked = true;
            if (vm.licenseNumberLength.length == 1 || vm.licenseNumberLength.length == 2) vm.lengthChecked = true;
        }
    }
})();
