# portalApplication

## 실행 방법

1. NVM 설치

 nodejs 설치를 편리하게 할 수 있음  
 nvm 설치 후 `nvm install latest` 명령을 통해 nodejs를 쉽게 설치할 수 있음  
 해당 프로젝트에서는 6.8.1 버전을 사용하는 것을 권장함  
 아래 명령과 같이 설치하면 됨
 ```
 nvm install 6.8.1
 nvm use 6.8.1
 ```

2. NPM 유틸리티 설치

 bower와 gulp를 사용하므로 아래와 같이 설치하면 됨
 ```
 npm install -g bower
 npm install -g gulp
 ```
 

3. NODEJS 필요 모듈 설치

 ```
 npm install
 ```

4. BOWER 라이브러리 설치

 ```
 bower install
 ```

5. Spring Boot 서버 띄우기

 ```
 mvnw
 ```

6. gulp를 이용해 client모듈 실행하기

 ```
 gulp
 
 ```

This application was generated using JHipster 3.10.0, you can find documentation and help at [https://jhipster.github.io/documentation-archive/v3.10.0](https://jhipster.github.io/documentation-archive/v3.10.0).

기본 사용자 계정 정보

admin/admin  -> 2차 인증 1111

p1manager / !qaz2wsx



## Development

Before you can build this project, you must install and configure the following dependencies on your machine:
1. [Node.js][]: We use Node to run a development web server and build the project.
   Depending on your system, you can install Node either from source or as a pre-packaged bundle.

After installing Node, you should be able to run the following command to install development tools (like
[Bower][] and [BrowserSync][]). You will only need to run this command when dependencies change in package.json.

    npm install

We use [Gulp][] as our build system. Install the Gulp command-line tool globally with:

    npm install -g gulp-cli

Run the following commands in two separate terminals to create a blissful development experience where your browser
auto-refreshes when files change on your hard drive.

    ./mvnw
    gulp

Bower is used to manage CSS and JavaScript dependencies used in this application. You can upgrade dependencies by
specifying a newer version in `bower.json`. You can also run `bower update` and `bower install` to manage dependencies.
Add the `-h` flag on any command to see how you can use it. For example, `bower update -h`.

For further instructions on how to develop with JHipster, have a look at [Using JHipster in development][].

## Building for production

To optimize the portalApplication application for production, run:

    ./mvnw -Pprod clean package

This will concatenate and minify the client CSS and JavaScript files. It will also modify `index.html` so it references these new files.
To ensure everything worked, run:

    java -jar target/*.war

Then navigate to [http://localhost:8080](http://localhost:8080) in your browser.

Refer to [Using JHipster in production][] for more details.

## Testing

To launch your application's tests, run:

    ./mvnw clean test

### Client tests

Unit tests are run by [Karma][] and written with [Jasmine][]. They're located in `src/test/javascript/` and can be run with:

    gulp test


### Other tests

Performance tests are run by [Gatling][] and written in Scala. They're located in `src/test/gatling` and can be run with:

    ./mvnw gatling:execute

For more information, refer to the [Running tests page][].

## Using Docker to simplify development (optional)

You can use Docker to improve your JHipster development experience. A number of docker-compose configuration are available in the `src/main/docker` folder to launch required third party services.
For example, to start a mysql database in a docker container, run:

    docker-compose -f src/main/docker/mysql.yml up -d

To stop it and remove the container, run:

    docker-compose -f src/main/docker/mysql.yml down

You can also fully dockerize your application and all the services that it depends on.
To achieve this, first build a docker image of your app by running:

    ./mvnw package -Pprod docker:build

Then run:

    docker-compose -f src/main/docker/app.yml up -d

For more information refer to [Using Docker and Docker-Compose][], this page also contains information on the docker-compose sub-generator (`yo jhipster:docker-compose`), which is able to generate docker configurations for one or several JHipster applications.

## Continuous Integration (optional)

To set up a CI environment, consult the [Setting up Continuous Integration][] page.

[JHipster Homepage and latest documentation]: https://jhipster.github.io
[JHipster 3.10.0 archive]: https://jhipster.github.io/documentation-archive/v3.10.0

[Using JHipster in development]: https://jhipster.github.io/documentation-archive/v3.10.0/development/
[Using Docker and Docker-Compose]: https://jhipster.github.io/documentation-archive/v3.10.0/docker-compose
[Using JHipster in production]: https://jhipster.github.io/documentation-archive/v3.10.0/production/
[Running tests page]: https://jhipster.github.io/documentation-archive/v3.10.0/running-tests/
[Setting up Continuous Integration]: https://jhipster.github.io/documentation-archive/v3.10.0/setting-up-ci/

[Gatling]: http://gatling.io/
[Node.js]: https://nodejs.org/
[Bower]: http://bower.io/
[Gulp]: http://gulpjs.com/
[BrowserSync]: http://www.browsersync.io/
[Karma]: http://karma-runner.github.io/
[Jasmine]: http://jasmine.github.io/2.0/introduction.html
[Protractor]: https://angular.github.io/protractor/
