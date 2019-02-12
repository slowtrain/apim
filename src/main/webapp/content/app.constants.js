(function () {
    'use strict';
    angular
        .module('portalApplicationApp')
        .constant('VERSION', "0.0.1-SNAPSHOT")
        .constant('DEBUG_INFO_ENABLED', true)
        .constant('CommonConstants', {

            // main 화면에 노출할 포럼 이름(최대 3개)
            'mainForumTitles' : ['공지사항', 'FAQ'],
            // 게시글 작성시 카테고리 선택을 허용하는 포럼 이름
            'allowedSelectCategoryForums': ['기술 Q&A', '서비스 Q&A', '서비스 제안'],
            // 게시글 작성시 비밀글을 허용하는 포럼 이름 (댓글은 무조건 비밀글 허용)
            'allowedPrivateWritingForums': ['기술 Q&A', '서비스 Q&A', '서비스 제안'],
            // 댓글을 허용하는 포럼 이름
            'allowedReplyWritingForums': ['포럼 전체', '기술 Q&A', '서비스 Q&A', '서비스 제안'],
            // 로그인 sms 인증이 필요한 아이디(운영자)
            'needSecondaryAuthUsers': ['admin'],
            // 서비스 추천 카테고리 제목(서비스 조회, 운영자-컨텐츠관리, 관리-서비스관리 화면에 함께 반영됨)
            'serviceCategoryTitles' : ['제공기관', '서비스분류 1', '서비스분류 2'],
            // 전화 지역번호, 인터넷 전화국번, 휴대폰 식별번호
            'districtNums' : ['02', '031', '032', '033', '041', '042', '043', '044', '051', '052', '053', '054', '055', '061', '062', '063', '064', '070'],
            'cellIdentifyingNums' : ['010', '011', '016', '017', '018', '019'],
            // 파일업로드 기능에서 허용하는 단일파일 용량 (예외: WAS의 설정, 또는 yml의 설정값이 더 작게 설정된 경우는 WAS, yml의 설정이 우선적용)
            'attachFileSize': 1024*1024*5,
            // 파일업로드 기능에서 허용하는 1회 업로드시 복수파일의 합계 용량 (예외: WAS의 설정, 또는 yml의 설정값이 더 작게 설정된 경우는 WAS, yml의 설정이 우선적용)
            'totalFileSize': 1024*1024*25,
            // 에디터(summernote)에서 업로드할 수 있는 이미지 용량 (예외: 운영자-컨텐츠관리-서비스의 에디터내용, 관리-서비스관리의 에디터내용)
            'editorImageFileSize': 1024*500
        });
})();
