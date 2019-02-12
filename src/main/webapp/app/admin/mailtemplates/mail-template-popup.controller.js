(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('MailTemplatePopupController', MailTemplatePopupController);

    MailTemplatePopupController.$inject = ['CommonConstants','CommonUtil','$rootScope', '$uibModalInstance', 'selections'];

    function MailTemplatePopupController (CommonConstants, CommonUtil, $rootScope, $uibModalInstance, selections) {

        var vm = this;
        vm.selections = angular.copy(selections);
        vm.templateName = angular.copy(selections.template.name);
        vm.clear = clear;
        vm.save = save;
        vm.maximumFileSizeError = maximumFileSizeError;

        vm.summernoteToolbar =
        {
            toolbar: [
                ['edit',['undo','redo']],
                ['headline', ['style']],
                ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
                ['fontface', ['fontname']],
                ['textsize', ['fontsize']],
                ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
                ['help', ['help']],
                ['height', ['height']],
                ['fontclr', ['color']],
                ['table', ['table']],
                ['insert', $rootScope.check_ie9 ? ['link','video','hr'] : ['link','picture','video','hr']],
                ['view', ['fullscreen', 'codeview']]
            ],
            lang: 'ko-KR',
            maximumImageFileSize: CommonConstants.editorImageSize,
            callbacks: {
                onImageUploadError : vm.maximumFileSizeError
            }
        };

        function maximumFileSizeError(){
            CommonUtil.onError('파일사이즈가 '+ CommonUtil.fileSize({fileSize:CommonConstants.editorImageSize}) +'를 초과했습니다.');
        }

        vm.email=vm.selections.template.emailAddress.split('@')[0];
        //vm.smsContents=vm.selections.template.smsContents.split(';');

        function save () {
            vm.selections.template.emailAddress = vm.email+'@shinhan.com';
            //vm.selections.template.smsContents = vm.smsContents.join(';');
            $uibModalInstance.close(vm.selections.template);
        }

        function clear () {
            vm.selections = selections;
            $uibModalInstance.dismiss();
        }
    }
})();
