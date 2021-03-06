"use strict";
angular.module("swaggerUi").config(["swaggerTranslatorProvider", function (a) {
    a.addTranslations("ko", {
        appTitle: "API Testbed",
        infoContactCreatedBy: "작성자 {{name}}",
        infoContactUrl: "URL",
        infoContactEmail: "이메일",
        infoLicense: "라이센스: ",
        infoBaseUrl: "Base URL",
        infoApiVersion: "API 버전",
        infoHost: "호스트",
        endPointToggleOperations: "보이기/숨기기",
        endPointListOperations: "엔드포인트 목록",
        endPointExpandOperations: "엔드포인트 전체 보기",
        operationDeprected: "Warning: Deprecated",
        operationImplementationNotes: "기능 설명",
        externalDocs: "외부 문서",
        headers: "응답 헤더",
        headerName: "헤더",
        headerDescription: "설명",
        headerType: "헤더 타입",
        parameters: "파라미터",
        parameterName: "파라미터",
        parameterValue: "값",
        parameterDescription: "설명",
        parameterType: "파라미터 타입",
        parameterDataType: "데이터 타입",
        parameterOr: " 또는 ",
        parameterRequired: "(필수)",
        parameterModel: "모델",
        parameterSchema: "모델 스키마",
        parameterContentType: "파라미터 컨텐트 타입",
        parameterDefault: "{{default}} (기본)",
        parameterSetValue: "파라미터로 지정하려면 클릭",
        responseClass: "응답　클래스 (상태 {{status}})",
        responseModel: "모델",
        responseSchema: "모델 스키마",
        responseContentType: "응답 컨텐트 타입",
        responses: "응답 메시지",
        responseCode: "HTTP 응답 코드",
        responseReason: "사유",
        responseHide: "응답 숨기기",
        modelOptional: "선택사항",
        modelOr: " 또는 ",
        explorerUrl: "요청 URL",
        explorerBody: "응답 바디",
        explorerCode: "응답 코드",
        explorerHeaders: "응답 헤더",
        explorerLoading: "로딩 중...",
        explorerTryIt: "요청하기!",
        errorNoParserFound: "No parser found for Swagger specification of type {{type}} and version {{version}}",
        errorParseFailed: "Swagger스펙 파싱에 실패하였습니다. : {{message}}",
        errorJsonParse: "JSON 파싱에 실패하였습니다.",
        errorNoYamlParser: "YAML파서를 찾지 못하였습니다.js-yaml library를 추가해 주세요.",
        authRequired: "인증이 필요로 합니다.",
        authAvailable: "Available authorizations",
        apiKey: "API key authorization",
        authParamName: "Name",
        authParamType: "In",
        authParamValue: "Value",
        basic: "Basic authorization",
        authLogin: "Login",
        authPassword: "Password",
        oauth2: "oAuth2 authorization",
        authOAuthDesc: "Scopes are used to grant an application different levels of access to data on behalf of the end user. Each API may declare one or more scopes. API requires the following scopes. Select which ones you want to grant.",
        authAuthorizationUrl: "Authorization URL",
        authFlow: "Flow",
        authTokenUrl: "Token URL",
        authScopes: "Scopes",
        authCancel: "Cancel",
        authAuthorize: "Authorize",
        generateSourceCode: 'Sample Code 생성'
    })
}]);

