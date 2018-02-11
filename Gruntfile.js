module.exports = function(grunt) {
    var config = require('./.screeps.json');

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-rsync');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.initConfig({
        copy: {
            prepare: {
                files: [{src: 'node_modules/screeps-profiler/screeps-profiler.js', dest: 'screeps-profiler.js'}]
            }
        },

        screeps: {
            options: {
                email: config.email,
                password: config.password,
                branch: config.branch,
                ptr: config.ptr
            },
            dist: {
                files: [
                    {
                        src: [
                            '*.js'
                        ]
                    }
                ]
            }
        },

        rsync: {
            options: {
                args: ["--verbose", "--checksum", "-d"],
                exclude: [".git*"],
                delete: true
            },
            private: {
                options: {
                    src: '*',
                    dest: config.private_directory
                }
            }
        }
    });

    grunt.registerTask('dist', ['copy:prepare', 'screeps:dist']);
    grunt.registerTask('private', ['copy:prepare', 'rsync:private']);
}
