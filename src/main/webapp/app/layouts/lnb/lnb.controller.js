(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('LnbController', LnbController);

    LnbController.$inject = ['CommonUtil', 'GeneralInfo', 'Principal', '$rootScope', '$state', 'ProfileService'];

    function LnbController(CommonUtil, GeneralInfo, Principal, $rootScope, $state, ProfileService) {
        var vm = this;
        vm.$state = $state;
        vm.exclude = exclude;
        vm.authorityFilter = authorityFilter;
        vm.gotoContents =gotoContents;
        vm.scrollTop = CommonUtil.scrollTop;
        vm.isActive = isActive;
        vm.$rootScope = $rootScope;

        function  isActive(menu) {
            if (menu.subs) return false;
            if (vm.isServiceCategory && $rootScope.contentId == menu.id) return true;
            if (vm.parent) return (vm.parent.parent == 'account' && vm.current.parent == menu.name)
                                        || (vm.parent.parent == 'admin' && vm.current.parent == menu.name)
                                        || (vm.parent.parent == 'app' && vm.current.name == menu.name)
                                        || (vm.parent.parent == 'informations' && vm.parent.name == menu.name);
        }

        function gotoContents(menu) { // 기관이 없는 admin은 account.role이 null임을 주의할 것
            vm.scrollTop();
            if (vm.isServiceCategory) {
                $rootScope.contentId = menu.id;
                $state.reload('service-package-info');
            } else if(menu.url == 'approval' && vm.ofPartner && !vm.isManager) $state.go('approvalHistory', {}, {reload:true});
            else if(menu.url == 'charge-manage' && vm.ofPartner) $state.go('charge-search', {}, {reload:true});
            else $state.go(menu.url, {}, {reload:true});
        }

        refresh();

        $rootScope.$on('authenticationSuccess', function () {
            refresh();
        });

        $rootScope.$on('logout', function () {
            refresh();
        });

        // directView location search Event
        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            refresh();
            //if (toState.data.secondDepth) {
            //    vm.menus = toState.data.secondDepth;
            //    subMenuPush(toState.parent, vm.subMenus);
            //}
        });

        function refresh() {
            // search location
            if ($state.current.name == 'service-package-info') {
                vm.isServiceCategory = true;
                vm.rooScopeContentId = $rootScope.contentId;
                GeneralInfo.allContents({kind: 'service-package', sort:'usePriority,asc', useYn:'Y', noContentsBody: true, noContentsIcon: true}).$promise.then(function(response){
                    vm.menus = response;
                    vm.menus.unshift({id:-1, url:'service-package', title:'서비스 조회'});
                });
            }else{
                vm.isServiceCategory = false;
                vm.parent = $state.get(vm.$state.current.parent);
                vm.current = $state.get(vm.$state.current.name);
                vm.menus = vm.current.data.secondDepth;
                vm.subMenus = vm.parent.data.thirdDepth;
                if (vm.menus) subMenuPush(vm.parent.name, vm.subMenus);
            }

//            ProfileService.getProfileInfo().then(function (response) {
//                vm.activeProfiles = response.activeProfiles;
//                // menu를 profiles에 따라 표현 여부를 결정한다.
//                if (vm.menus = vm.current.data.secondDepth) {
//                    vm.menus = vm.current.data.secondDepth.filter(function (depth) {
//                        if (!depth.profiles) return true;
//                        for (var i = 0; i < depth.profiles.length; i++) {
//                            if (vm.activeProfiles.indexOf(depth.profiles[i]) !== -1) return true;
//                        }
//                        return false;
//                    });
//                }
//            });
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


        //admin일 경우 승인요청목록 제외
        // 이용기관 소속일 경우 일부통계(API제공, API과금징구, 토큰발행) 제외, 특히 이용기관 일반유저는 승인대기목록도 제외된다.
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

        function subMenuPush(parent, subMenu) {
            vm.menus.forEach(function (menu) {
                menu.hasSubs = !!$state.get(menu.name).data.thirdDepth;
                menu.subs = null;
                if (menu.name == parent) {
                    menu.subs = subMenu;
                    menu.parent = parent;
                }
            });
        }

        function authorityFilter(menu) {
            return !menu.authority || ($rootScope.account && $rootScope.account.authorities &&  $rootScope.account.authorities.indexOf(menu.authority) > -1);
        }
    }
})();
