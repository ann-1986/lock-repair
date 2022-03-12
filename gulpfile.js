'use strict';

var gulp = require('gulp'),
	concat = require('gulp-concat'),
	prefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	rigger = require('gulp-rigger'),
	cleanCss = require('gulp-clean-css'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	svgSprite = require('gulp-svg-sprite'),
	svgmin = require('gulp-svgmin'),
	replace = require('gulp-replace'),
	browserSync = require("browser-sync").create(),
	del = require("del"),
	cache = require("gulp-cache"),
	cheerio = require('gulp-cheerio'),
	imageminJpegRecompress = require('imagemin-jpeg-recompress'),
	include = require('gulp-html-tag-include'),
	merge = require('merge-stream'),
	spritesmith = require('gulp.spritesmith');


var path = {
	//папка куда складываются готовые файлы
	build: {
		html: 'build/',
		js: 'build/js/',
		css: 'build/css/',
		img: 'build/img/',
		fonts: 'build/fonts/',
		spritePng: 'build/img/'
	},
	//папка откуда брать файлы
	src: {
		html: 'src/**/!(*.inc).html',
		js: [
			'src/vendor/jquery-3.2.1.min.js', 
			'src/vendor/slick/slick.min.js',
			'src/vendor/owlcarousel/owl.carousel.min.js',
			'src/vendor/jquery.inputmask.bundle.js',
			'src/vendor/fancybox/jquery.fancybox.min.js',
			'src/vendor/wow.min.js',
			'src/js/**/*.js', 
			'src/js/main.js'
		],
		style: 'src/sass/main.scss',
		css: 'src/css/*.css',
		img: 'src/img/**/*.*',
		fonts: 'src/fonts/**/*.*',
		spritePng: 'src/sprites/*.*'
	},
	//указываем после измененя каких файлов нужно действовать
	watch: {
		html: 'src/**/*.html',
		js: 'src/js/**/*.js',
		style: 'src/sass/**/*.scss',
		css: 'src/css/**/*.css',
		img: 'src/img/**/*.*',
		svg: 'src/img/sprite/**/*.svg',
		fonts: 'src/fonts/**/*.*',
		spritePng: 'src/sprites/*.*',
	},
	clean: './build'
};

var config = {
	server: {
		baseDir: "./build" //из какой папки показывать
	},
	tunnel: false,
	host: 'localhost',
	port: 8080,
	open: true,
	notify: false,
	logPrefix: "gl"
};

function fonts() {
	return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts));
}

function images() {
	return gulp.src(path.src.img)
		.pipe(cache(imagemin([
			imagemin.gifsicle({ interlaced: true }),
			imagemin.jpegtran({ progressive: true }),
			imageminJpegRecompress({
				loops: 5,
				min: 65,
				max: 85,
				quality: 'high'
			}),
			imagemin.svgo({
				plugins: [
					{ cleanupIDs: false },
					{ removeUselessDefs: false },
					{ removeViewBox: true },
				]
			}),
			imagemin.optipng({ optimizationLevel: 3 }),
			pngquant({ quality: '65-70', speed: 5 })
		], {
			verbose: true
		})))
		.pipe(gulp.dest(path.build.img))
		.pipe(browserSync.reload({ stream: true }));
}
function sprite() {
	return gulp.src('src/img/sprite/**/*.svg')
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(cheerio({
			run: function ($) {
				// $('[fill]').removeAttr('fill');
				// $('[stroke]').removeAttr('stroke');
				// $('[style]').removeAttr('style');
			},
			parserOptions: { xmlMode: true }
		}))
		.pipe(replace('&gt;', '>'))
		.pipe(svgSprite({
			shape: {
				transform: []
			},
			mode: {
				symbol: {
					sprite: "../sprite.svg",
				}
			}
		}))

		.pipe(gulp.dest('src/img'))
}

function spritePng() {
	var spriteData = gulp.src(path.src.spritePng).pipe(spritesmith({
		imgName: 'sprite.png',
		imgPath: '/img/sprite.png',
		cssName: 'sprite.scss'
	}));
	var imgStream = spriteData.img
		.pipe(gulp.dest(path.build.spritePng));

	var cssStream = spriteData.css
		.pipe(gulp.dest('src/sass/'));
	return merge(imgStream, cssStream);
}

function html() {
	return gulp.src(path.src.html)
		.pipe(rigger())
		.pipe(include())
		.pipe(gulp.dest(path.build.html))
		.pipe(browserSync.reload({ stream: true }));
}

function styles() {
	return gulp.src(path.src.style)
		.pipe(sourcemaps.init())
		
		.pipe(sass())
		
		.pipe(prefixer({
			overrideBrowserslist: ['> 0.5%', 'last 2 version'],
			cascade: false
		}))
		.pipe(cleanCss({
			level: 2
		}))
		.pipe(concat("app.css"))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.build.css))
		.pipe(browserSync.reload({ stream: true }));
}
function css() {
	return gulp.src(path.src.css)
		.pipe(gulp.dest(path.build.css))
		.pipe(browserSync.reload({ stream: true }));
}

function scripts() {
	return gulp.src(path.src.js)
		.pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest(path.build.js))
		.pipe(browserSync.reload({ stream: true }));
}

function watch() {
	browserSync.init(config)
	gulp.watch(path.watch.spritePng, spritePng);
	gulp.watch(path.watch.style, styles);
	gulp.watch(path.watch.css, css);
	gulp.watch(path.watch.js, scripts);
	gulp.watch(path.watch.html, html);
	gulp.watch(path.watch.fonts, fonts);
	gulp.watch(path.watch.img, images);
	gulp.watch(path.watch.svg, sprite);


}

function clean() {
	return del(['build/*']);
}

gulp.task('fonts', fonts);
gulp.task('sprite', gulp.series(sprite, images));
gulp.task('images', images);
gulp.task('html', html);
gulp.task('styles', styles);
gulp.task('css', css);
gulp.task('scripts', scripts);
gulp.task('watch', watch);
gulp.task('spritePng', spritePng);

gulp.task('build', gulp.series(clean,
	gulp.parallel(spritePng, styles, css, scripts, html, sprite, images, fonts
	)));

gulp.task('dev', gulp.series('spritePng', 'build', 'watch'));

