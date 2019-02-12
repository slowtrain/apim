(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ContentsProviderController', ContentsProviderController);

    ContentsProviderController.$inject = ['ApiGroup', 'GeneralInfo', 'CommonConstants', '$rootScope', '$compile', '$timeout', '$state', '$stateParams', '$scope', 'Api', '$uibModal', 'CommonUtil'];

    function ContentsProviderController(ApiGroup, GeneralInfo, CommonConstants, $rootScope, $compile, $timeout, $state, $stateParams, $scope, Api, $uibModal, CommonUtil) {

        var vm = this;
        vm.authorities = ['ROLE_PLAN_VIEW'];
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
        vm.checkValid = checkValid;

        vm.serviceCategoryTitles = CommonConstants.serviceCategoryTitles;

        stateCheck($state.current.name);

        function stateCheck(currentName) {
            switch(currentName){
                case 'provider-service-package' :
                    vm.current = { state : '서비스', title : '서비스명', kind : 'service-package' };
                    loadCommonServiceTemplate();
                    break;
            }
        }

        function loadCommonServiceTemplate() {
            GeneralInfo.getByTitle({title:'공통템플릿', kind:'service-package'}).$promise.then(function(response){
                vm.commonTemplate = response;
            });
        }

        function checkValid() {
            return vm.current.kind=='service-package' && (!vm.contents.contentsIcon)
                        || vm.current.kind=='news-stand' && !vm.contents.contentsIcon
                        || vm.current.kind !='news-stand' && !vm.contents.contentsBody;
            /*return vm.current.kind=='service-package' && (!vm.contents.contentsIcon || !vm.contents.apiGroups.length)
                        || vm.current.kind=='news-stand' && !vm.contents.contentsIcon
                        || vm.current.kind !='news-stand' && !vm.contents.contentsBody;*/
        }

        vm.condition = {
            kind: vm.current.kind,
            size: vm.size,
            page: vm.page,
            sort: vm.sort
        };

        loadAll();

        vm.delContents = delContents;
        vm.addContents = addContents;
        vm.editContents = editContents;
        vm.showContents = showContents;
        vm.mappingApiGroups = mappingApiGroups;

        vm.maximumImageFileSizeCheck = maximumImageFileSizeCheck;
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

        function maximumImageFileSizeCheck(){
            CommonUtil.onError('이미지크기가 '+CommonUtil.fileSize({fileSize: CommonConstants.editorImageFileSize})+'를 초과했습니다.')
        }

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function mappingApiGroups() {
            $uibModal.open({
                templateUrl: 'app/account/contents-provider/mapping-contents-provider.html',
                controller: 'MappingContentsProviderController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
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

        function readOnlyToggle() {
            vm.readOnly = false;
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            vm.showDiv = false;
            GeneralInfo.providerContents(vm.condition, onSuccess, onError);
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
            GeneralInfo.listCategories().$promise.then(function(response){
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
            if (vm.current.kind =='service-package' && $scope.vm.commonTemplate) { // 서비스 패키지 신규등록시 템플릿을 초기로딩한다.
                vm.contents.contentsBody = $scope.vm.commonTemplate.contentsBody;
                vm.original = angular.copy(vm.contents); // 리셋버튼 클릭시 원복시킬 내용저장
                $timeout(function () {
                    $("#contentsBody").html($scope.vm.commonTemplate.contentsBody);
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
            var name = (contents.useYn=='Y')? "현재 사용중인 컨텐츠입니다. 그래도": "해당 컨텐츠를";
            var customfunc = function (result) {
                if (result) GeneralInfo.delContents({id: contents.id}, function() { loadAll(0) }, onError);
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
            vm.contents.serviceClassifyList = vm.allCategories.filter(function(c) {
                return c.checked;
            });
            if (vm.mode == 'register') GeneralInfo.addContents(vm.contents, function() { loadAll(0) });
            else GeneralInfo.editContents({id: vm.contents.id}, vm.contents, loadAll);
        }
    }
})();
