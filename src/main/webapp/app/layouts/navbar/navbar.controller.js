(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['Account', '$window', 'GeneralInfo', 'CommonUtil', '$rootScope', '$state', 'Auth', 'Principal', 'ProfileService', 'LoginService', '$scope', '$timeout', 'Idle', 'Keepalive', '$uibModal'];

    function NavbarController(Account, $window, GeneralInfo, CommonUtil, $rootScope, $state, Auth, Principal, ProfileService, LoginService, $scope, $timeout, Idle, Keepalive, $uibModal) {

        var vm = this;

        vm.stateChange = stateChange;
        vm.isNavbarCollapsed = true;
        vm.isAuthenticated = Principal.isAuthenticated;
        vm.secondFilter = secondFilter;
        vm.exclude = exclude;
        vm.forumInit = forumInit;
        vm.login = login;
        vm.logout = logout;
        vm.toggleNavbar = toggleNavbar;
        vm.collapseNavbar = collapseNavbar;
        vm.isActive = isActive;
        vm.$state = $state;
        vm.gotoContents =gotoContents;
        vm.setBlur = setBlur;
        vm.authorityFilter = authorityFilter;
        vm.scrollTop = CommonUtil.scrollTop;

        callMenus();

        //$window.onbeforeunload = logout; //이 이벤트는 새로고침마저 logout 시킨다.
        $window.onunload = logout;

        /*$(window).on('beforeunload', 'unload', function(e) {
            //$window.open("app/layouts/error/unload.html", "unload", "width=10,height=10,location=no,status=no,titlebar=no,toolbar=no",true);
            logout();
        });*/

        $(window).on('resize', function(e){
            if ($(window).width() < 1281) {
                $window.resizeTo(1280, 800);
            }
         });

        ProfileService.getProfileInfo().then(function (response) {
            vm.inProduction = response.inProduction;
            vm.swaggerEnabled = response.swaggerEnabled;
            vm.inDev = response.inDev;

            // 운영환경에서 시작화면에 보여줄 modal 창
            if (vm.inProduction) {
                //CommonUtil.onError("서비스 점검 중입니다.",'md','noService',null,'서비스 점검');
            }
        });

        function setBlur(menu, second, secondIdx, third) {
            // third 있는 경우
            if (third) {
                var thirdList = second.thirdDepth.filter(exclude);
                if (third == thirdList[thirdList.length-1]) {
                    second.isopen = false;
                    if (secondIdx == menu.secondDepth.length -1) menu.isopen = false;
                }
            // third 없고 second만 있는 경우
            } else if (!second.thirdDepth || !second.thirdDepth.length) {
                second.isopen = false;
                // menu.contents(서비스패키지) 링크인 경우와 아닌 경우
                if ((menu.contents && secondIdx == menu.contents.length -1) || (!menu.contents && secondIdx == menu.secondDepth.length -1)) menu.isopen = false;
            }
        }

        function checkAuthorities(){
            if($rootScope.account){
                vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
                vm.isManager = $rootScope.account.authorities.indexOf('ROLE_MANAGER') > -1 ||
                                        $rootScope.account.authorities.indexOf('ROLE_MANAGER_PROVIDER') > -1 ||
                                        $rootScope.account.authorities.indexOf('ROLE_MANAGER_PARTNER') > -1;
                if ($rootScope.account.organization) {
                    vm.ofProvider = $rootScope.account.organization.type == 'PROVIDER';
                    vm.ofPartner = $rootScope.account.organization.type == 'PARTNER';
                }
            }
        }

        checkAuthorities();

        function authorityFilter(menu) {
            return !menu.authority || ($rootScope.account && $rootScope.account.authorities &&  $rootScope.account.authorities.indexOf(menu.authority) > -1);
        }

        function secondFilter(menu) { // 순수 운영자는 account.role 데이터가 없음을 주의
            if (menu.name=='account' && !!$rootScope.account.role && $rootScope.account.role.code == 'ROLE_USER_MEMBER') $state.go('approvalHistory');
            else $state.go(menu.secondDepth[0].url);
        }



        //admin일 경우 승인요청목록 제외
        // 이용기관 소속일 경우 일부통계(API제공, API과금징구, 토큰발행) 제외, 특히 이용기관 일반유저는 승인대기목록도 제외된다.
        // 제공기관 소속일 경우 과금계좌관리, 사용과금조회 메뉴 제외
        function exclude(subMenu) {
            if($rootScope.account){
                checkAuthorities();
                if (vm.isAdmin && !$rootScope.account.organization) return !(subMenu.url == 'approvalRequest' || subMenu.url == 'approvalLine');
                else if(vm.ofPartner) {
                    if (!vm.isManager) return !(subMenu.url == 'approval' || subMenu.url == 'approvalLine' || subMenu.url == 'report-api-providing' || subMenu.url == 'report-billing-providing' || subMenu.url == 'charge-manage' || subMenu.url == 'charge-adjust');
                    return !(subMenu.url == 'approvalLine' || subMenu.url == 'report-api-providing' || subMenu.url == 'report-billing-providing' || subMenu.url == 'charge-manage' || subMenu.url == 'charge-adjust');
                } else if(vm.ofProvider) {
                    return !(subMenu.url == 'charge-account' || subMenu.url == 'charge-search');
                }
            }else return true;
        }

        function stateChange(menu, second){
            collapseNavbar(menu);
            if(second.url == 'approval' && vm.ofPartner && !vm.isManager) $state.go('approvalHistory', {}, {reload:true});
            else if(second.url == 'charge-manage' && vm.ofPartner) $state.go('charge-search', {}, {reload:true});
            else $state.go(second.url);
        }

        function gotoContents(menu, content) {
            $rootScope.contentId = (content)? content.id : '-1';
            if ($state.current.name == menu.url) $state.reload(menu.url);
            else $state.go(menu.url);
            collapseNavbar(menu);
        }

        function callMenus() {
            vm.menus = [];
            $state.get('app').data.firstDepth.forEach(function(menu){
                if (menu.name == 'service-package-open') {
                    GeneralInfo.allContents({kind: 'service-package', sort:'usePriority,asc', useYn:'Y', noContentsBody: true, noContentsIcon: true}).$promise.then(function(response){
                        response.unshift({id:-1, url:'service-package', title:'서비스 조회'});
                        vm.menus.splice(1, 0, {name: menu.name, url:menu.url, contents : response});
                    });
                }else{
                    var secondDepth = $state.get(menu.name).data.secondDepth;
                    if(secondDepth) {
                        secondDepth.forEach(function(second){
                            if($state.get(second.name).data.thirdDepth) second.thirdDepth = $state.get(second.name).data.thirdDepth;
                        });
                    }
                    if(!$state.get(menu.name)) return true;
                    else vm.menus.push({name:menu.name, url:menu.url, authority:menu.authority, secondDepth:secondDepth});
                }
            });
        }

        function isActive(root) {
            return $state.includes(root);
        }

        function login() {
            collapseNavbar();
            $state.go('login');
        }

        function logout() {
            collapseNavbar();
            Auth.logout();
            $rootScope.$broadcast('userLogout');
        }

        function toggleNavbar() {
            vm.isNavbarCollapsed = !vm.isNavbarCollapsed;
        }

        function collapseNavbar(menu) {
            if (menu) menu.isopen = false;
            vm.isNavbarCollapsed = true;
            CommonUtil.scrollTop();
        }

        $scope.linkCheck = function (menu) {
            if (menu == "login") login();
            else if (menu == "logout") logout();
            else collapseNavbar(menu);
        };

        function forumInit (paramUrl) {
            if (paramUrl == 'forumCommunity') $rootScope.paramUrl = {};
            //포럼 오픈 메뉴를 클릭했을 경우 $rootScope에 담겨있는 기존 포럼연결정보를 초기화한다. 그래야 전체글목록으로 간다.
        }

        //스크롤시 bg 화이트 처리
        $(window).on('scroll', function(e){
            var bodyOffset = $(document).scrollTop();
            if(bodyOffset > 200){
                $('.navbar-default').addClass('add-bg')
            } else {
                $('.navbar-default').removeClass('add-bg')
            }
         });

    }
})();
