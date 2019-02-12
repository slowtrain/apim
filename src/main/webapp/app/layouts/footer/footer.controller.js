(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('FooterController', FooterController);

    FooterController.$inject = ['CommonUtil', 'GeneralInfo', '$rootScope', 'Principal', '$state', '$scope'];

    function FooterController (CommonUtil, GeneralInfo, $rootScope, Principal, $state, $scope) {
        var vm = this;
        vm.scrollTop = CommonUtil.scrollTop;
        vm.gotoSite = gotoSite;
        vm.gotoContents =gotoContents;

        //callMenus();

        function gotoContents(menu, content) {
            $rootScope.contentId = content.id;
            $state.go(menu.url);
        }

        vm.familySites = [
            {name:'신한금융지주', url:'http://www.shinhangroup.com'},
            {name:'신한은행', url:'http://www.shinhan.com'},
            {name:'신한카드', url:'http://www.shinhancard.com'},
            {name:'신한금융투자', url:'http://www.shinhaninvest.com'},
            {name:'신한생명', url:'http://www.shinhanlife.co.kr'},
            {name:'신한DS', url:'http://www.shinhansys.co.kr'}
        ];

        function gotoSite(site) {
            if (site) {
                var windowOpen = window.open('about:blank');
                windowOpen.location.href=site.url;
            }
        }

        function callMenus() {
            vm.menus = [];
            $state.get('app').data.firstDepth.forEach(function(menu){
                if (menu.name == 'service-package-open') {
                    vm.menus.splice(1, 0, {name: menu.name, url:menu.url, contents : $rootScope.serviceCategories});
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

        $scope.forumInit = function () {
            $rootScope.paramUrl = {};
        }
    }
})();
