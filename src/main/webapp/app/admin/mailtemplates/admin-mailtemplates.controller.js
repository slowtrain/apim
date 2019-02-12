(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('MailTemplateController', MailTemplateController);

    MailTemplateController.$inject = ['CommonConstants', '$rootScope', 'CommonUtil', '$uibModal', 'MailTemplate', 'Principal'];

    function MailTemplateController(CommonConstants, $rootScope, CommonUtil, $uibModal, MailTemplate, Principal) {

        var vm = this;
        vm.authorities = ['ROLE_ADMIN'];
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
            maximumImageFileSize: CommonConstants.editorImageFileSize,
            callbacks: {
                onImageUploadError : vm.maximumImageFileSizeCheck
            }
        };

        function maximumImageFileSizeCheck(){
            CommonUtil.onError('이미지크기가 '+CommonUtil.fileSize({fileSize: CommonConstants.editorImageFileSize})+'를 초과했습니다.')
        }

        vm.size = 10;
        vm.page = 0;
        vm.sort = 'code,asc';
        vm.sorting = sorting;
        vm.condition = {
            size: vm.size,
            page: vm.page,
            sort: vm.sort
        };

        vm.clear = clear;
        vm.save = save;
        vm.saveSmsOnOff = saveSmsOnOff;
        vm.pageChanged = pageChanged;
        vm.popupTemplate = popupTemplate;
        vm.delTemplate = delTemplate;
        vm.sendNoti = sendNoti;
        vm.loadAll = loadAll;
        vm.loadAll();

        function sendNoti() {
            $uibModal.open({
                templateUrl: 'app/admin/mailtemplates/select-receivers-noti.html',
                controller: 'SelectReceiversNotiController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'xl'
            }).result.then(function (result) {
                MailTemplate.sendNotification(result, onSuccess, onError);
            });
        }

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option, 'code,asc');
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function loadAll() {
            vm.editShow = false;
            MailTemplate.getDetail({code : 'SEND_NOTIFICATION'}).$promise.then(function(response){
                vm.notiTemplate = response;
            });
            MailTemplate.list(vm.condition, function (response, headers) {
                vm.mailTemplates = response;
                vm.totalItems = headers('x-total-count');
                vm.smsOnOff = {
                        code : 'SMS_ON_OFF',
                        smsContents : headers('SMS_ON_OFF')
                };
            });
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function popupTemplate(template) {
//            vm.template = template;
//            vm.selections = angular.copy(vm.template);
//            vm.email=vm.selections.emailAddress.split('@')[0];
//            vm.editShow = true;
            $uibModal.open({
                templateUrl: 'app/admin/mailtemplates/mail-template-popup.html',
                controller: 'MailTemplatePopupController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    selections: {
                        template: template
                    }
                }
            }).result.then(function (result) {
                MailTemplate.update({code: result.code}, result, onSuccess, onError);
            });
        }

        function delTemplate(template) {
            var name = "해당 템플릿을";
            var customfunc = function (result) {
                if (result) MailTemplate.delete({code: template.code}, function() { loadAll(0) }, onError);
            };
            CommonUtil.deleteModal(name, customfunc);
        }

        function saveSmsOnOff () {
            MailTemplate.update({code: vm.smsOnOff.code}, vm.smsOnOff, onSuccess, onError);
        }

        function save () {
            //vm.selections.emailAddress = vm.email+'@hanafn.com';
            MailTemplate.update({code: vm.selections.code}, vm.selections, onSuccess, onError);
        }

        function clear () {
            vm.editShow = false;
            vm.loadAll();
        }

        function onSuccess() {
            vm.editShow = false;
            vm.loadAll();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();
