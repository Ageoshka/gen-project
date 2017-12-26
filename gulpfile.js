var gulp = require('gulp'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    cleanCss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create(),
    del = require('del'),
    cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    jpegrecompress = require('imagemin-jpeg-recompress'),
    pngquant = require('imagemin-pngquant'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch'),
    wrap = require("gulp-wrap-js");

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: './src'
        },
        open: false,
        notify: false
    });
});

gulp.task('css', function(){
    return gulp.src('./src/scss/**/*.scss')
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(concat('default.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src/css'))
        .pipe(browserSync.stream());
});

gulp.task('js', function() {
    return gulp.src([
        './src/sjs/modules/global.js',
        './src/sjs/modules/*.js',
        './src/sjs/init.js'
    ])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('default.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src/js'));
});

gulp.task('vendor-js', function() {
    return gulp.src([
        './src/sjs/vendor/jquery-3.2.1.min.js',
        './src/sjs/vendor/*.js'
    ])
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error);
                this.emit('end');
            }
        }))
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src/js'));
});

gulp.task('img', function() {
    return gulp.src('./src/i/**/*')
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error);
                this.emit('end');
            }
        }))
        .pipe(cache(imagemin([
            imagemin.gifsicle({interlaced: true}),
            jpegrecompress({quality: 'high', min: 80}),
            pngquant(),
            imagemin.svgo()
        ], {verbose: true})))
        .pipe(gulp.dest('./dist/i'));
});

gulp.task('clean', function() {
    return del.sync('./dist');
});

gulp.task('clear-cache', function () {
    return cache.clearAll();
});

gulp.task('watch', ['css', 'js', 'vendor-js', 'browser-sync'], function() {
    watch('./src/scss/**/*', function() {
        gulp.start('css');
    });

    watch('./src/sjs/vendor/*.js', function() {
        gulp.start('vendor-js');
    });

    watch('./src/sjs/modules/*.js', function() {
        gulp.start('js');
    });

    watch('./src/js/*.js', function() {
        browserSync.reload();
    });

    watch('./src/**/*.html', function() {
        browserSync.reload();
    });
});

gulp.task('build', ['clean', 'css', 'js', 'vendor-js', 'img'], function() {
    var css = gulp.src('./src/css/*.css')
            .pipe(autoprefixer({
                browsers: ['last 10 versions'],
                cascade: false
            }))
            .pipe(cleanCss({
                level: {
                    1: {
                        specialComments: 0
                    },
                    2: {
                        mergeIntoShorthands: false
                    }
                }
            }))
            .pipe(gulp.dest('./dist/css')),

        js = gulp.src('./src/js/*.js')
            .pipe(wrap('(function(){ %= body % })();'))
            .pipe(uglify())
            .pipe(gulp.dest('./dist/js')),

        fonts = gulp.src(['./src/fonts/**/*', '!./src/fonts/selection.json'])
            .pipe(gulp.dest('./dist/fonts')),

        favicon = gulp.src('./src/html/*.ico')
            .pipe(gulp.dest('./dist')),

        html = gulp.src('./src/html/*.html')
            .pipe(gulp.dest('./dist/html'));

    return [css, js, fonts, favicon, html]
});

gulp.task('default', ['watch']);
