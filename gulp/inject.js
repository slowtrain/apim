'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    inject = require('gulp-inject'),
    es = require('event-stream'),
    naturalSort = require('gulp-natural-sort'),
    angularFilesort = require('gulp-angular-filesort'),
    bowerFiles = require('main-bower-files');

var handleErrors = require('./handle-errors');

var config = require('./config');

module.exports = {
    app: app,
    min: min,
    vendor: vendor,
    test: test,
    troubleshoot: troubleshoot
}

function app() {
    return gulp.src(config.app + 'index.html')
        .pipe(inject(gulp.src(config.app + 'app/**/*.js')
            .pipe(plumber({errorHandler: handleErrors}))
            .pipe(naturalSort())
            .pipe(angularFilesort()), {relative: true}))
        .pipe(inject(gulp.src([
            '!src/main/webapp/content/app.constants.js',
            '!src/main/webapp/content/javascript/an*.js',
            '!src/main/webapp/content/javascript/jq*.js',
            '!src/main/webapp/content/javascript/boot*.js',
            '!src/main/webapp/content/javascript/summer*.js',
            config.app + 'content/**/*.js'])
            .pipe(plumber({errorHandler: handleErrors}))
            .pipe(naturalSort())
            .pipe(angularFilesort()), {name:'content', relative: true}))
        .pipe(gulp.dest(config.app));
}

/*
 * 2018-07-18
 * 이 함수를 gulpfile.js에서 직접 task로 만들어 사용하면,
 * 본래 index.html파일을 덮어쓰지 못하고, dist폴더에 새 index.html파일이 만들어지는 문제가 있다.
 */
function min() {
    return gulp.src(config.app + 'index.html')
        .pipe(inject(gulp.src(config.buildDist + 'app.min.js')
            // relative true를 없애면 "/src/main/webapp/dist/app.min.js" 절대경로로 표시되어 주입된다.
            .pipe(plumber({errorHandler: handleErrors})), {relative: true}))
        .pipe(inject(gulp.src(config.buildDist + 'content.min.js')
            .pipe(plumber({errorHandler: handleErrors})), {name:'content', relative: true}))
        .pipe(gulp.dest(config.app));
}

function vendor() {
    var stream = gulp.src(config.app + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles(), {read: false}), {
            name: 'bower',
            relative: true
        }))
        .pipe(gulp.dest(config.app));

    return es.merge(stream, gulp.src(config.sassVendor)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles({filter:['**/*.{scss,sass}']}), {read: false}), {
            name: 'bower',
            relative: true
        }))
        .pipe(gulp.dest(config.scss)));
}

function test() {
    return gulp.src(config.test + 'karma.conf.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(inject(gulp.src(bowerFiles({includeDev: true, filter: ['**/*.js']}), {read: false}), {
            starttag: '// bower:js',
            endtag: '// endbower',
            transform: function (filepath) {
                return '\'' + filepath.substring(1, filepath.length) + '\',';
            }
        }))
        .pipe(gulp.dest(config.test));
}

function troubleshoot() {
    /* this task removes the troubleshooting content from index.html*/
    return gulp.src(config.app + 'index.html')
        .pipe(plumber({errorHandler: handleErrors}))
        /* having empty src as we dont have to read any files*/
        .pipe(inject(gulp.src('', {read: false}), {
            starttag: '<!-- inject:troubleshoot -->',
            removeTags: true,
            transform: function () {
                return '<!-- Angular views -->';
            }
        }))
        .pipe(gulp.dest(config.app));
}
