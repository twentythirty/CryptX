var gulp            = require('gulp');
var util            = require('gulp-util');
var sass            = require('gulp-sass');
var autoprefixer 	= require('gulp-autoprefixer' );
var cssmin          = require('gulp-cssmin');
var rename          = require('gulp-rename');
var iconfont 		= require( 'gulp-iconfont' );
var consolidate 	= require( 'gulp-consolidate' );
var lodash  		= require( 'lodash' );
var merge 			= require('merge-stream');



gulp.task('sass', function () {
  return gulp.src('./sass/index.scss')
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./css'))
  .pipe(autoprefixer('last 3 versions'));
});

gulp.task('default', function () {
    gulp.src('./css/*.css')
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./css'));
});

gulp.task('watch', function() {
  gulp.watch('./**/**/*.scss', ['sass']);
});

gulp.task('iconfont', function(){
	return gulp.src(['./fonts/svg/**/*.svg'])
		.pipe(
			iconfont({
				fontName: 'icons',
				appendUnicode: false,
				normalize: true,
				formats: ['ttf', 'eot', 'woff', 'svg']
			})
		)
		.on('glyphs', function(glyphs, options) {

			var unicodeGlyphs = [];

			for (var i = 0; i < glyphs.length; i++) {
				unicodeGlyphs.push({
					name: glyphs[i].name,
					unicode: glyphs[i].unicode[0].charCodeAt(0).toString(16).toUpperCase()
				});
			}
			var date = new Date().getTime();

			gulp.src('./fonts/templates/_icons.scss' )
			.pipe(consolidate('lodash', {
				glyphs: unicodeGlyphs,
				fontName: 'icons',
				//fontPath: './fonts/',
				className: 'icon',
				timestamp: date
			}))
			.pipe(gulp.dest('./sass/core/' ));
		})
		.pipe(gulp.dest( './fonts/' ));
});

gulp.task('sync', function() {
	var sass = gulp.src(['./sass/**/*.scss', '!./sass/**/_config.scss'])
	.pipe(gulp.dest('./../front-end/src/sass/'));

	var images = gulp.src(['./img/**/*.*'])
	.pipe(gulp.dest('./../front-end/src/assets/img/'));

	var fonts = gulp.src(['./fonts/**/*.*'])
	.pipe(gulp.dest('./../front-end/src/assets/fonts/'));

	return merge(sass, images, fonts);
});