/*global require*/
'use strict';

require.config({
    shim: {
    },
    paths: {
        jquery: '../bower_components/jquery/dist/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        app:'./app',
        pageslider:'./pageslider',
        calculate_num: './calculate_num'
    }
});

require([
    'jquery','backbone','app'
], function ($,Backbone,App) {
    App.init();
});
