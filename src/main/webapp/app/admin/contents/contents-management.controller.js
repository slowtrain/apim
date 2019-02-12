(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ContentsManagementController', ContentsManagementController);

    ContentsManagementController.$inject = ['ApiGroup', 'GeneralInfo', 'CommonConstants', '$rootScope', '$compile', '$timeout', 'ContentsManagement', '$state', '$stateParams', '$scope', 'Api', '$uibModal', 'CommonUtil'];

    function ContentsManagementController(ApiGroup, GeneralInfo, CommonConstants, $rootScope, $compile, $timeout, ContentsManagement, $state, $stateParams, $scope, Api, $uibModal, CommonUtil) {

        var vm = this;
        vm.authorities = ['ROLE_ADMIN'];
        vm.totalItems = null;
        vm.size = 10;
        vm.page = 0;
        vm.sort = 'id,desc';
        vm.sorting = sorting;
        vm.pageChanged = pageChanged;

        vm.readOnlyToggle = readOnlyToggle;
        vm.save = save;
        vm.clear = clear;
        vm.readOnly = true;
        vm.loadAll = loadAll;
        vm.setPriority = setPriority;
        vm.checkValid = checkValid;

        vm.serviceCategoryTitles = CommonConstants.serviceCategoryTitles;

        stateCheck($state.current.name);

        function stateCheck(currentName) {
            switch(currentName){
                case 'admin-portal-terms' :
                    vm.current = { state : 'Market 이용안내', title : '제목', kind : 'portal-terms' };
                    break;
                case 'admin-service-package' :
                    vm.current = { state : '서비스', title : '서비스명', kind : 'service-package' };
                    break;
                case 'admin-privacy-policy' :
                    vm.current = { state : '개인정보 처리방침', title : '제목', kind : 'privacy-policy' };
                    break;
                case 'admin-agreeform' :
                    vm.current = { state : '개인정보 수집동의서', title : '제목', kind : 'agreeform' };
                    break;
                case 'admin-popup-notice' :
                    vm.current = { state : '팝업 공지', title : '제목', kind : 'popup-notice' };
                    break;
                case 'admin-news-stand' :
                    vm.current = { state : '뉴스 스탠드', title : '제목', kind : 'news-stand' };
                    break;
            }
        }

        vm.condition = {
                kind: vm.current.kind,
                size: vm.size,
                page: vm.page,
                sort: vm.sort
        };

        if ($rootScope.fromState.url == '/') initOnStateChangeSuccess();
        $scope.$on('$stateChangeSuccess', initOnStateChangeSuccess);

        function initOnStateChangeSuccess() {
            stateCheck($state.current.name);
            vm.condition.kind = angular.copy(vm.current.kind);
            $timeout(function(){
                if (vm.condition.kind == 'service-package') loadCommonServiceTemplate();
                loadAll(0);
            });
        }

        function loadCommonServiceTemplate() {
            ContentsManagement.getByTitle({title:'공통템플릿', kind:'service-package'}).$promise.then(function(response){
                vm.commonTemplate = response;
            });
        }

        vm.delContents = delContents;
        vm.addContents = addContents;
        vm.editContents = editContents;
        vm.showContents = showContents;
        vm.mappingApiGroups = mappingApiGroups;
        vm.manageCategories = manageCategories;
        vm.settingUse = settingUse;

        vm.maximumImageFileSizeCheck = maximumImageFileSizeCheck;

        vm.iconEditorToolbar =
        {
            toolbar: [
                ['insert', ['picture']]
            ],
            lang: 'ko-KR',
            maximumImageFileSize: CommonConstants.editorImageFileSize,
            callbacks: {
                onImageUploadError : vm.maximumImageFileSizeCheck
            }
        };

        vm.summernoteToolbar =
        {
            toolbar: [
                ['edit',['undo','redo']],
                ['headline', ['style']],
                ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
                ['fontface', ['fontname']],
                ['textsize', ['fontsize']],
                ['fontclr', ['color']],
                ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
                ['height', ['height']],
                ['table', ['table']],
                ['insert', $rootScope.check_ie9 ? ['link','video','hr'] : ['link','picture','video','hr']],
                ['view', ['fullscreen', 'codeview']],
                ['help', ['help']]
            ],
            lang: 'ko-KR',
            //maximumImageFileSize: CommonConstants.editorImageFileSize,
            callbacks: {
                onImageUploadError : vm.maximumImageFileSizeCheck
            }
        };

        function maximumImageFileSizeCheck(){
            CommonUtil.onError('이미지크기가 '+CommonUtil.fileSize({fileSize: CommonConstants.editorImageFileSize})+'를 초과했습니다.')
        }

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function checkValid() {
            return vm.current.kind=='service-package' && (!vm.contents.contentsIcon)
                        /*|| vm.current.kind=='news-stand' && !vm.contents.contentsIcon*/
                        || vm.current.kind !='news-stand' && !vm.contents.contentsBody;
            /*return vm.current.kind=='service-package' && (!vm.contents.contentsIcon || !vm.contents.apiGroups.length)
                        || vm.current.kind=='news-stand' && !vm.contents.contentsIcon
                        || vm.current.kind !='news-stand' && !vm.contents.contentsBody;*/
        }

        function manageCategories() {
            $uibModal.open({
                templateUrl: 'app/admin/contents/managing-categories.html',
                controller: 'ManagingCategoriesController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg'
            }).result.then(function (result) {
                //vm.contents.apiGroups = result;
            });
        }

        function mappingApiGroups() {
            $uibModal.open({
                templateUrl: 'app/admin/contents/mapping-contents.html',
                controller: 'MappingContentsController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'xl',
                resolve: {
                    selectedContents : {
                        data : vm.contents,
                        type : 'mappingApiGroups'
                    }
                }
            }).result.then(function (result) {
                vm.contents.apiGroups = result;
            });
        }

        function settingUse(contents, useYn, showYn) {
            ContentsManagement.settingUse({id: contents.id, useYn: useYn, showYn: showYn}, function(){
                loadAll();
                if (contents.kind =='service-package') {
                    GeneralInfo.allContents({kind: 'service-package', noContentsBody: true, noContentsIcon: true}).$promise.then(function(response){
                        $rootScope.serviceCategories = response;
                        $state.reload();
                    });
                }
            }, onError);
        }

        function setPriority() {
            GeneralInfo.allContents({kind: 'service-package', useYn:'Y', noContentsBody: true, noContentsIcon: true}).$promise.then(function(response){
                if (!response.length) CommonUtil.onError('공개용 컨텐츠를 먼저 설정하십시오.');
                else {
                    $uibModal.open({
                        templateUrl: 'app/admin/contents/contents-priority.html',
                        controller: 'ContentsPriorityController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'md',
                        resolve: {
                            items : {
                                data : response
                            }
                        }
                    }).result.then(function (result) {
                        if(result){
                            ContentsManagement.settingPriority(result, function(){ $state.reload() }, onError);
                        }
                    });
                }
            });
        }

        function readOnlyToggle() {
            vm.readOnly = false;
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            vm.showDiv = false;
            ContentsManagement.allContents(vm.condition, onSuccess, onError);
        }

        function onSuccess(data, headers) {
            vm.totalItems = headers('X-Total-Count');
            vm.contentsList = data;
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function loadCategories(contents) {
            if (vm.current.kind != 'service-package') return;
            ContentsManagement.listCategories().$promise.then(function(response){
                vm.allCategories = response;
                if (contents && contents.serviceClassifyList && contents.serviceClassifyList.length > 0) {
                    contents.serviceClassifyList.forEach(function(s) {
                        vm.allCategories.some(function(c) {
                            if (s.id == c.id) c.checked = true;
                            return s.id == c.id;
                        });
                    });
                }
            });
        }

        function addContents() {
            vm.readOnly = false;
            vm.showDiv = true;
            vm.mode = 'register';
            vm.contents = {apiGroups:[]}
            if (vm.current.kind =='service-package' && vm.commonTemplate) { // 서비스 패키지 신규등록시 템플릿을 초기로딩한다.
                vm.contents.contentsBody = vm.commonTemplate.contentsBody;
                vm.original = angular.copy(vm.contents); // 리셋버튼 클릭시 원복시킬 내용저장
                $timeout(function () {
                    $("#contentsBody").html(vm.commonTemplate.contentsBody);
               });
            }
            loadCategories();
        }

        function editContents(contents) {
            vm.showDiv = true;
            vm.mode = 'edit';
            vm.readOnly = false;
            vm.contents = contents;
            vm.original = angular.copy(contents);
            $timeout(function () {
                $("#contentsBody").html(vm.contents.contentsBody);
                if (contents.kind =='service-package') $("#contentsIcon").html(vm.contents.contentsIcon);
            });
            loadCategories(contents);
        }

        function delContents(contents) {
            var name = (contents.useYn=='Y')? "현재 사용중인 컨텐츠입니다.<br/>그래도": "해당 컨텐츠를";
            var customfunc = function (result) {
                if (result) ContentsManagement.delContents({id: contents.id}, function() { $state.reload() }, onError);
            };
            CommonUtil.deleteModal(name, customfunc);
        }

        function clear() {
            vm.contents = (vm.mode == 'register' && vm.current.kind !='service-package') ? {} : angular.copy(vm.original); //2-way binding 막기위해서.
            loadCategories(vm.contents);
            $timeout(function () {
                $compile($('#summernoteEditor').contents())($scope);
                if (vm.contents.kind =='service-package') $compile($('#iconEditor').contents())($scope);
            });
        }

        function showContents(contents) {
            $uibModal.open({
                templateUrl: 'app/services/common/terms-modal.html',
                controller: 'termsModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'xl',
                resolve: {
                    item: {
                        contents: contents,
                        type: 'contentsManagement'
                    }
                }
            });
        }

        function save() {
            vm.contents.kind = vm.current.kind;
            if (vm.current.kind == 'service-package') {
                vm.contents.serviceClassifyList = vm.allCategories.filter(function(c) {
                    return c.checked;
                });
            }
            //if (!vm.contents.serviceClassifyList.length) CommonUtil.onError("추천 카테고리 설정이 필요합니다.");
            //else {
                if (vm.mode == 'register') ContentsManagement.addContents(vm.contents, function() { initOnStateChangeSuccess() });
                else ContentsManagement.editContents(vm.contents, loadAll);
            //}
        }
    }
})();
