(function () {
    'use strict';

    angular
        .module('portalApplicationApp', [
            'ngStorage',
            'tmh.dynamicLocale',
            'pascalprecht.translate',
            'ngResource',
            'ngCookies',
            'ngAria',
            'ngCacheBuster',
            'ngFileUpload',
            'ngSanitize',
            'ui.bootstrap',
            'ui.bootstrap.datetimepicker',
            'ui.router',
            'ui.sortable',
            'gridster',
            'nvd3',
            'ngMask',
            'infinite-scroll',
            'summernote',
            'ngIdle',
            'ngAnimate',
            'angular-loading-bar'
            //'angularValidator',
            //'ngBusy',
            //'cgBusy'
        ])
        .config(['$httpProvider', '$locationProvider', 'IdleProvider', 'KeepaliveProvider',
            function ($httpProvider, $locationProvider, IdleProvider, KeepaliveProvider) {
                IdleProvider.idle(1500);    // 1500초 후 timeout modal 보여줌
                IdleProvider.timeout(10);   // 60초 동안 modal 보여줌
                KeepaliveProvider.interval(10);

                $httpProvider.defaults.transformResponse.splice(0, 0, function (data, headersGetter) {
                    var contentType = headersGetter()['content-type'];
                    if (data && contentType && contentType.indexOf('application/json') >= 0) {
                        return JSOG.parse(data);
                    }
                    return data;
                });
                //$locationProvider.html5Mode(true);
            }])
        .run(run);

    run.$inject = ['$uibModalStack', '$rootScope', 'stateHandler', 'translationHandler', 'Principal', 'Idle', '$uibModal', 'Account', 'Auth', '$state', 'Organization', 'ProfileService', 'GeneralInfo'];

    function run($uibModalStack, $rootScope, stateHandler, translationHandler, Principal, Idle, $uibModal, Account, Auth, $state, Organization, ProfileService, GeneralInfo) {
        $rootScope.check_ie = navigator.userAgent.indexOf('Trident') >=0; //ie에 swiper css를 적용하기 위한 체크.
        $rootScope.check_ie9 = navigator.userAgent.indexOf('Trident/5.0') >=0; //ie9 약간의 차이가 있어서 따로 구분
        $rootScope.check_Edge = navigator.userAgent.indexOf('Edge') >=0; //Edge 약간의 차이가 있어서 따로 구분

        $rootScope.state = $state;

        $rootScope.fileUploadHelpPopover = {
            apiSpec: 'app/layouts/popover-template/fileupload-help-spec-popover.html',
            all: 'app/layouts/popover-template/fileupload-help-popover.html',
        };

        $rootScope.allowCopy = false;

        $(function(){
            $(document).siteSecurity({
                f12:'y',
                printScreen:'y',
                rightclick:'y',
                A:'y' // ctrl+A
            }, $rootScope);
        });

        // IE에서 작동하지 않는 함수 poliyfill
        if (!String.prototype.startsWith) {
            String.prototype.startsWith = function(searchString, position) {
              return this.substr(position || 0, searchString.length) === searchString;
          };
        }
        if (!String.prototype.includes) {
            String.prototype.includes = function(search, start) {
                'use strict';
                if (typeof start !== 'number') {
                    start = 0;
                }
                if (start + search.length > this.length) {
                    return false;
                } else {
                    return this.indexOf(search, start) !== -1;
                }
            };
        }

        ProfileService.getProfileInfo().then(function (response) {
            // 이메일 사용여부
            $rootScope.emailEnabled = response.emailEnabled;
        });

        // 서버의 session timeout 시간을 UI 타임 아웃을 설정한다.
        function checkSession() {
            Account.checkSession().$promise.then(function (response) {
                if (response.timeout) {
                    if (response.timeout > 600) {
                        $rootScope.idleTimeout = response.timeout - 300; // 5분전
                        Idle.setTimeout(60);
                    } else if (response.timeout > 120) {
                        $rootScope.idleTimeout = response.timeout - 60;  // 1분전
                        Idle.setTimeout(30);
                    } else {
                        $rootScope.idleTimeout = response - 20;  // 20초전
                        Idle.setTimeout(10);
                    }
                    Idle.setIdle($rootScope.idleTimeout);
                }
            });
        }

        stateHandler.initialize();
        translationHandler.initialize();

        $rootScope.loginId = getLoginId;        // login id 가져오기
        $rootScope.loginName = getLoginName;    // 사용자 이름 가져오기

        getAccount();

        // 로그인 성공 시
        $rootScope.$on('authenticationSuccess', function () {
            checkSession();
            getAccount();
        });

        // 로그아웃 발생 시
        $rootScope.$on('logout', function () {
            $rootScope.stopTimeout();
            window.localStorage.setItem('loginStatus', 'logOut'); // 팝업창을 위해 필요한 코딩.
            $state.go('home');
        });

        function getAccount() {
            Principal.identity().then(function (account) {
                $rootScope.isAuthenticated = Principal.isAuthenticated;
                $rootScope.account = account;
                // 로그인 되어 있는 상태라면
                if (account) {
                    $rootScope.organization = Organization.current();
                    $rootScope.stopTimeout();
                    $rootScope.startTimeout();
                }
            });
        }

        function getLoginId() {
            return $rootScope.account ? $rootScope.account.login : "";
        }

        function getLoginName() {
            return $rootScope.account ? $rootScope.account.fullName : "";
        }

        $rootScope.paramUrl = {};
        $rootScope.contentId = -1; // 서비스 패키지 페이지 전환을 위해 사용된다.

        ////// Timeout 관련 //////
        $rootScope.startTimeout = function () {
            closeTimeoutModals();
            Idle.watch();
            $rootScope.timeoutStarted = true;
        };

        $rootScope.stopTimeout = function () {
            closeTimeoutModals();
            Idle.unwatch();
            $rootScope.timeoutStarted = false;
        };

        function closeTimeoutModals() {
            if ($rootScope.warningModal) {
                $rootScope.warningModal.close();
                $rootScope.warningModal = null;
            }

            if ($rootScope.timeoutModal) {
                $rootScope.timeoutModal.close();
                $rootScope.timeoutModal = null;
            }
        }

        // timeout이 시작되면
        $rootScope.$on('IdleStart', function () {
            closeTimeoutModals();
            $rootScope.warningModal = $uibModal.open({
                templateUrl: 'warning-dialog.html',
                windowClass: 'modal-danger'
            });
        });

        // timeout이 되었을 때 - 로그아웃 진행
        $rootScope.$on('IdleTimeout', function () {
            closeTimeoutModals();
            $uibModalStack.dismissAll(); // 기존에 열린 모든 모달창을 닫는다.
            Auth.logout();
            $rootScope.timeoutModal = $uibModal.open({
                templateUrl: 'timedout-dialog.html',
                windowClass: 'modal-danger'
            });
        });

        // 사용자에 의해 timeout 종료 - 로그인 유지
        $rootScope.$on('IdleEnd', function () {
            closeTimeoutModals();
            Account.checkSession(); // 서버와 세션 유지를 위해 호출한다.
        });
    }
})();
