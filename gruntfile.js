module.exports = function(grunt) {
	// LiveReload的默认端口号，你也可以改成你想要的端口号
	var lrPort = 35729;
	// 使用connect-livereload模块，生成一个与LiveReload脚本
	// <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
	var lrSnippet = require('connect-livereload')({
		port: lrPort
	});
	// 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
	var lrMiddleware = function(connect, options) {
		return [
			// 把脚本，注入到静态文件中
			lrSnippet,
			// 静态文件服务器的路径
			connect.static(options.base),
			// 启用目录浏览(相当于IIS中的目录浏览)
			connect.directory(options.base)
		];
	};
	require('load-grunt-tasks')(grunt); //加载所有的任务
	grunt.initConfig({
		// 读取我们的项目配置并存储到pkg属性中
		pkg: grunt.file.readJSON('package.json'),
		connect: {
			options: {
				// 服务器端口号
				port: 8000,
				// 服务器地址(可以使用主机名localhost，也能使用IP)
				hostname: '127.0.0.1',
				// 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
				base: '.'
			},
			livereload: {
				options: {
					// 通过LiveReload脚本，让页面重新加载。
					middleware: lrMiddleware
				}
			}
		},
		sass: {
			compile: {
				options: {
					style: 'expanded'
				},
				files: [{
					expand: true,
					cwd: 'lib/sass',
					src: ['**/*.scss'],
					dest: 'lib/css',
					ext: '.css'
				}]
			}
		},
		coffee: {
			compile: {
				expand: true,
				cwd: '.',
				src: ['**/*.coffee'],
				dest: '.',
				ext: '.js',
				options: {
					bare: true,
					preserve_dirs: true
				}
			}
		},
		watch: {
			// html: {
			// 	files: ['**/*.html']
			// },
			// sass: {
			// 	files: '<%= sass.compile.files[0].src %>',
			// 	tasks: ['sass']
			// },
			// coffee: {
			// 	files: '<%= coffee.compile.src %>',
			// 	tasks: ['coffee']
			// }
			// ,
			client: {
				// 我们不需要配置额外的任务，watch任务已经内建LiveReload浏览器刷新的代码片段。
				options: {
					livereload: lrPort
				},
				// '**' 表示包含所有的子目录
				// '*' 表示包含所有的文件
				files: ['./outform/**/*.html', 'css/*', 'js/*', 'images/**/*']
			}
		},
		bower: {
			install: {
				options: {
					targetDir: './public/lib',
					layout: 'byType',
					install: true,
					verbose: false,
					cleanTargetDir: false,
					cleanBowerDir: false,
					bowerOptions: {}
				}
			}
		}
	});

	// grunt.loadNpmTasks('grunt-contrib-sass');
	// grunt.loadNpmTasks('grunt-contrib-coffee');
	// grunt.loadNpmTasks('grunt-contrib-watch');
	// grunt.loadNpmTasks('grunt-bower-task');
	// grunt.loadNpmTasks('grunt-contrib-connect');
	// grunt.loadNpmTasks('grunt-contrib-watch');

	return grunt.registerTask('default', ['connect','watch']);
};