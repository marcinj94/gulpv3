var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var changed = require('gulp-changed');
var htmlReplace = require('gulp-html-replace');
var htmlMin = require('gulp-htmlmin');
var del = require('del');
var sequence = require('run-sequence');

var config = {
    dist: 'dist/',
    src: 'src/',
    cssin: 'src/css/**/*.css',
    jsin: 'src/js/**/*.js',
    imgin: 'src/img/**/*.{jpg,jpeg,png,gif}',
    htmlin: 'src/*.html',
    scssin: 'src/scss/**/*.scss',
    cssout: 'dist/css/',
    jsout: 'dist/js/',
    imgout: 'dist/img/',
    htmlout: 'dist/',
    scssout: 'src/css/',
    cssoutname: 'style.css',
    jsoutname: 'script.js',
    cssreplaceout: 'css/style.css',
    jsreplaceout: 'js/script.js'
}

gulp.task('reload', function () {
    browserSync.reload();
});

gulp.task('serve', ['sass'], function () {
    browserSync({
        server: config.src
    });

    gulp.watch([config.htmlin, config.jsin], ['reload']);
    gulp.watch([config.scssin], ['sass']);
});

gulp.task('sass', function () {
    // w folderze src bedzie folder scss i potem kazdy scss moze byc nawet w podfolderze (dzieki **)
    return gulp.src(config.scssin)
        .pipe(sourcemaps.init())
        // w pipe to co chcemy zeby robilo, niech sie wywola funkcja o nazwie sass
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 3 versions']
        }))
        .pipe(sourcemaps.write())
        // folder wyjsciowy, zmiany maja byc zapisane w folderze css
        .pipe(gulp.dest(config.scssout))
        //i pipe z browserSynciem, zeby byla wywolana funkcja stream czyli odswiezanie
        .pipe(browserSync.stream());

});

gulp.task('css', function () {
    return gulp.src(config.cssin)
        .pipe(concat(config.cssoutname))
        .pipe(cleanCSS())
        //folder wyjsciowy
        .pipe(gulp.dest(config.cssout));
});

gulp.task('js', function () {
    return gulp.src(config.jsin)
        .pipe(concat(config.jsoutname))
        .pipe(uglify())
        .pipe(gulp.dest(config.jsout));
});

gulp.task('img', function () {
    return gulp.src(config.imgin)
        // changed powoduje ze optymalizuje tylko te grafiki ktore nie zostaly zoptymalizowane
        .pipe(changed(config.imgout))
        .pipe(imagemin())
        .pipe(gulp.dest(config.imgout));
})

gulp.task('html', function () {
    return gulp.src(config.htmlin)
        .pipe(htmlReplace({
            'css': config.cssreplaceout,
            'js': config.jsreplaceout
        }))
        .pipe(htmlMin({
            // sortAttributes -> atrybuty zwiazane z elementami sa posortowane alfabetycznie
            sortAttributes: true,
            // sortClassName -> sortuje klasy alfabetycznie
            sortClassName: true,
            // collapseWhitespace -> usuwa biale znaki
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(config.dist))
})

gulp.task('clean', function () {
    // usuwanie folderu dist!
    return del([config.dist])
});

gulp.task('build', function () {
    sequence('clean', ['html', 'js', 'css', 'img']);
});

gulp.task('default', ['serve']);

