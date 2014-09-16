module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        changelog: {},

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },

        jshint: {
            options: {
                node: true,
                browser: true,
                esnext: true,
                bitwise: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg: true,
                regexp: true,
                undef: true,
                unused: true,
                trailing: true,
                smarttabs: true,
                globals: {
                    L: false,
                    EXIF: false,
                    jQuery: false,
                    MapKnitter: true,

                    /* Test environment */
                    describe: false,
                    it: false,
                    before: false,
                    after: false,
                    beforeEach: false,
                    afterEach: false,
                    chai: false,
                    sinon: false
                }
            },
            source: {
                files: [{
                    expand: true,
                    cwd: 'javascripts/',
                    src: [ '**.js', '*/*.js', '*/*/*.js', '!uploads-gps-exif.js' ]
                }]
            },
            config: {
                src: ['Gruntfile.js', 'package.json' ]
            }
        },

        watch: {
            options : {
                livereload: 7777
            },
            source: {
                files: [
                    'javascripts/*.js',
                    'javascripts/*/*.js',
                    'javascripts/*/*/*.js',
                    'Gruntfile.js'
                ],
                tasks: [ 'build' ]
            }
        }
    });

    grunt.registerTask('default', [ 'watch' ]);

    grunt.registerTask('build', [ 'jshint' ]);

};
