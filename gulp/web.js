
/*
 * 따로 dist 폴더를 만들어서 js, img, fonts, i18n, index.html을 새로 성성하였을 경우에
 * cmd창에서 node web.js 명령을 실행하여 해당 dist 폴더의 패키지를 실행시킬 수 있다.
 */

var http = require('http'),
    express = require('express'),
    path = require('path');

var static = require('serve-static');
var port = 8000;
var app = express();

app.use(static(path.join(__dirname, 'dist')));
app.set('port', process.env.PORT || port);

http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스 서버 기동 완료' + app.get('port'));
});