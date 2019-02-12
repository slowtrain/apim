(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$document', 'CommonConstants', 'GeneralInfo', '$rootScope', '$scope', '$timeout', '$window', '$filter', 'Post', 'Principal', 'LoginService', '$state', '$interval', '$uibModal', 'Forum', 'CommonUtil', 'ProfileService'];

    function HomeController($document, CommonConstants, GeneralInfo, $rootScope, $scope, $timeout, $window, $filter, Post, Principal, LoginService, $state, $interval, $uibModal, Forum, CommonUtil, ProfileService) {
        var vm = this;
        vm.goUrl = goUrl;
        vm.goForum = goForum;
        vm.htmlToPlainText = htmlToPlainText;
        vm.gotoContents = gotoContents;
        vm.scrollTop = CommonUtil.scrollTop;
        vm.swiperAutoplay = swiperAutoplay;
        $window.$windowScope = $scope;

        // 메인화면에 보여줄 포럼 타이틀 가져오기
        vm.mainForums = [];
        vm.mainForumTitles = CommonConstants.mainForumTitles;
        vm.mainForumTitles.forEach(function(title, i){
            Forum.findId({orgName:null, forumTitle:title}).$promise.then(function(response) {
                Post.list({forumId: response.id, size: 3, page: 0, sort: 'id,desc'}).$promise.then(function (response) {
                    vm.mainForums.push({id: i, title: title, posts: response});
                    if (title=='공지사항') showNotice();
                });
            });
        });

        Forum.findId({orgName:null, forumTitle:"뉴스 스탠드"}).$promise.then(function(response) {
            vm.newsStand = response;
        });

        GeneralInfo.allContents({kind: 'service-package', showYn:'Y', noContentsBody: true}).$promise.then(function(response){
            vm.apiServiceList = response;
            vm.apiServiceList.forEach(function(service){
                service.splitSentences = service.sentence.split('\\n').map(function(s, i) { // 똑같은 문장이 반복되는 경우를 고려하여 추가된 코딩
                    return {
                        idx: i,
                        sentence: s
                    };
                });
            });

            $timeout($scope.vm.swiper2.init);
            $scope.vm.swiper2.params.slidesOffsetAfter = (vm.apiServiceList.length-1) * 300; //아래 vm.swiper2 변수설정을 참조
        });

        GeneralInfo.allContents({kind: 'news-stand', useYn:'Y', noContentsBody: true}).$promise.then(function(response){
            vm.newsStandList = response;
            vm.newsStandList.forEach(function(news){
                news.splitSentences = news.sentence.split('\\n').map(function(s, i) { // 똑같은 문장이 반복되는 경우를 고려하여 추가된 코딩
                    return {
                        idx: i,
                        sentence: s
                    };
                });
            });
            $timeout($scope.vm.swiper3.init);
        });

        function gotoContents(service) {
            $rootScope.contentId = (service)? service.id : '-1';
            $state.go('service-package-info');
            vm.scrollTop();
        }

        function htmlToPlainText(content) {
            return content? String(content).replace(/<[^>]+>/gm, '') : '';
        }

        vm.load = function (id, num) {
            //var id = index+1;
            var left = num * 415;
            var winId = "notice" + id;
            var winHtml = "notice" + id + ".html";
            $window.open($state.href('notice', {id: id}), winId, "width=400,height=400,resizable=yes,scrollbars=yes,left=" + left);
        };

        function showNotice() {
            GeneralInfo.allContents({kind: 'popup-notice', useYn:'Y'}).$promise.then(function (response){
                vm.popupNotices = response;
                if (CommonUtil.getStorage('showNotice') === null || CommonUtil.getStorage('showNotice') === undefined || CommonUtil.getStorage('showNotice')=='true' || ($scope.account && $scope.account.showNotice)) {
                    var j = 0, id = "", cookieName = "";
                    if (vm.popupNotices.length > 0) {
                        vm.popupNotices.forEach(function (notice, i) {
                            if (!CommonUtil.getStorage(notice.id+'done') || (new Date(CommonUtil.getStorage(notice.id+'done'))).getTime() < (new Date()).getTime()) {
                                cookieName = 'show' + (notice.id);
                                CommonUtil.setStorage(cookieName, notice.id);
                                vm.load(notice.id, j++);
                                if ((new Date(CommonUtil.getStorage(notice.id+'done'))).getTime() < (new Date()).getTime()) CommonUtil.removeStorage(notice.id+'done');
                            }
                        });
                    }
                }
            });
        }

        vm.account = null;
        vm.isAuthenticated = null;
        vm.loginCheck = Principal.isAuthenticated;

        $scope.$on('authenticationSuccess', function () {
            $state.reload();
            Principal.identity().then(function (account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
                CommonUtil.setStorage('showNotice', vm.account.showNotice);
                showNotice();
            });
        });

        function goUrl(url) {
            if($scope.account || url=='portal-info' || url=='register'){
                switch(url){
                case 'apiManage' : if(vm.isApiCreator) $state.go(url); break;
                case 'apiPlan' : if(vm.isPlanCreator) $state.go(url); break;
                case 'appManage' : if(vm.isAppCreator) $state.go(url); break;
                default : $state.go(url);
                }
            }else $state.go('login');
        }

        function goForum(params) {
            $rootScope.paramUrl = params;
            if ($state.current.name=='post.detail') $state.reload();
            else $state.go('forumCommunity');
        }

        vm.swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            loop:true,
            /*nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev',*/
            autoplay: 3000,
            autoplayDisableOnInteraction: false
        });

        function swiperAutoplay(play) {
            if (play) {
                $scope.vm.swiper.startAutoplay();
                $('.glyphicon-pause').show(); $('.glyphicon-play').hide();
            } else {
                $scope.vm.swiper.stopAutoplay();
                $('.glyphicon-pause').hide(); $('.glyphicon-play').show();
            }
        };

        vm.swiper2 = new Swiper('.swiper-container2', {
            init:false,

            /*
            setWrapperSize가 true일 경우, 모든 slide의 총 넓이가 wrapper size로 설정된다.
            setWrapperSize가 true일 경우, next button은 작동하지 않으므로, slidesOffsetAfter를 추가한다.
            spaceBetween을 따로 설정할 경우, next button 클릭시 slide 이동 넓이가 일정치 않게 된다.
            spaceBetween을 따로 설정하지 않으면, next button 클릭시 slide 이동 넓이가 300px로 고정된다.
            */
            setWrapperSize: true,
            //spaceBetween:30,

            /*
            init시에 적용되는 설정값은 originalParams에 들어가는 기본값이 된다.
            slidesOffsetAfter는 init 명령 이후에 다시 주입해야 하며, 주입값은 (전체 slide 개수-1) * 300px이다.
            slidesOffsetAfter값은 $scope.vm.swiper2.params.slidesOffsetAfter에 넣어야 한다.
            */
            slidesOffsetAfter: 300,

            /*
            setWrapperSize가 true일 경우, slidesPerView는 auto로 한다.
            */
            slidesPerView : 'auto',
            slidesPerGroup: 3,
            nextButton: '.api-next',
            prevButton: '.api-prev',
        })

        vm.swiper3 = new Swiper('.swiper-container3', {
            init:false,
            slidesPerView : 4,
            spaceBetween:14,
            nextButton: '.goRight',
            prevButton: '.goLeft',
        })

        angular.element($document).ready(function() {
            $(".wheel-section").each(function() {
                $(this).on("mousewheel DOMMouseScroll", function(e) {
                    e.preventDefault(); //마우스 휠을 빨리 돌렸을 경우를 감안하여 주석처리한다.
                    var delta = 0;
                    if (!event) event = window.event;
                    if (event.wheelDelta) {
                        delta = event.wheelDelta / 120;
                        if (window.opera) delta = -delta;
                    } else if (event.detail) delta = -event.detail / 3;
                    var moveTop = null;
                    //if (delta < 0) {
                    if (delta < 0 && $(this).next().length) {
                            moveTop = $(this).next().offset().top;
                    } else {
                        if ($(this).prev().length) {
                            moveTop = $(this).prev().offset().top < 200 ? 0 : $(this).prev().offset().top;
                        }
                        /*if ($(this).prev() != undefined ) {
                            moveTop = $(this).prev().offset().top;
                        }*/
                    }
                    $("html, body").stop().animate({
                        scrollTop: moveTop + 'px'
                    }, {
                        duration: 500, complete: function() {

                        }
                    });
                });
            });
        });

        /*
         * 신한에서 사용하지 않는 코드
         *
         * ProfileService.getProfileInfo().then(function (response) {
            vm.inProduction = response.inProduction;
            vm.cyberId = (vm.inProduction)? '1200' : '8935';
            vm.swaggerEnabled = response.swaggerEnabled;
            showNotice();
            checkAuthority();
        });

        vm.fivePackCategories = [];
        GeneralInfo.allContents({kind: 'service-package', showYn:'Y', lang:'KO', noContentsBody: true}).$promise.then(function(response){
            vm.apiServiceList = response;
            for(var i=0, j=parseInt((response.length-1)/5)+1 ; i < j ; i++) {
                vm.fivePackCategories[i] = response.slice(i*5, i*5+5);
            };
            $timeout(function(){
                vm.fivePackCategories[0].forEach(function(service){
                    $('#serviceIcon'+service.id).html(service.contentsIcon);
                });
            });
        });

        function checkAuthority(){
            if($scope.account && $scope.account.authorities.indexOf('ROLE_API_CREATE') > -1) {
                vm.isApiCreator = true;
            }else vm.apiTitle = "권한이 없습니다.";

            if($scope.account && $scope.account.authorities.indexOf('ROLE_PLAN_CREATE') > -1) {
                vm.isPlanCreator = true;
            }else vm.planTitle = "권한이 없습니다.";

            if($scope.account && $scope.account.authorities.indexOf('ROLE_APP_CREATE') > -1) {
                vm.isAppCreator = true;
            }else vm.appTitle = "권한이 없습니다.";
        }

        $scope.$on('userLogout', function() {
            checkAuthority();
        });

        vm.posts = response.filter(function (post) {
                    var limitDay = new Date();
                    var postCreatedDate = post.createdDate.split('+')[0]; // IE에서는 서버에서 기록한 시간끝에 붙은 '+0000'을 invalid로 인식하므로 제거한다.
                    var postDay = new Date(postCreatedDate);
                    var diff = limitDay.getTime() - postDay.getTime();
                    return diff < 3600000 * 72; //3일미만
                });

        function getServiceIcon(categories) {
            $('#serviceIcon'+categories.id).html(categories.contentsIcon);
            $('.apiImg p img').css('width','');
        }

        function getServiceIcon2(categories) {
            $('#newsIcon'+categories.id).html(categories.contentsIcon);
            $('.newsImg p img').css('width','');
        }
        */
    }
})();
