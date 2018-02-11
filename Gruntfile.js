module.exports = function(grunt) {
    var config = require('./.screeps.json');

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-rsync');

    grunt.initConfig({
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
                            '*.js',
                            'node_modules/screeps-profiler/screeps-profiler.js'
                        ]
                    }
                ]
            }
        },

        rsync: {
            options: {
                args: ["--verbose", "--checksum"],
                exclude: [".git*"],
                recursive: false
            },
            private: {
                options: {
                    src: '*',
                    dest: config.private_directory
                }
            }
        }
    });
}
