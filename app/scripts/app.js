define('app', ['jquery', 'backbone', 'pageslider', 'calculate_num'], function ($, Backbone, PageSlider, calculate_num) {
    var execute = function () {
        var pageslider = new PageSlider($('#container'));
        var indexTpl = $('#index_tpl').remove().html();
        var playerTpl = $('#player_tpl').remove().html();
        var questionTpl = $('#question_tpl').remove().html();
        var helpPanelTpl = $('#help_panel_tpl').remove().html();
        var successTpl = $('#success_tpl').remove().html();
        var failureTpl = $('#failure_tpl').remove().html();
        var bestScoreTpl = $('#best_score_tpl').remove().html();
        var shareTipTpl = $('#share_tip_tpl').remove().html();
        var barrier = 1;
        var playerPanel;
        var curQuestion;
        var allNums = [], allNumLen = allNums.length;
        var TOTAL_TIME_IN_SECONDS = 60,
            TICK_WIDTH = 4,
            BARRIER_LEFT = -50,
            BARRIER_RIGHT = 130,
            BARRIER_BOTTOM = 130,
            BARRIER_TOP = -50,
            CALRESULTGO = 120,
            TWO_ANGLE = 60,
            THREE_ANGLE = 45,
            FOUR_ANGLE = 40,
            SHARE_IMG_WIDTH = 250,
            SHARE_IMG_HEIGHT = 180;
        var imgUrl = 'http://img.bzhwj.com/'+ "/images/3824/indexlogo.png";
        var lineLink = location.href;
        var shareScore = localStorage.getItem('historyHighestScore') || 0;
        var shareBarrier = localStorage.getItem('maxBarrier') || 0;
        var shareTitle = '3824智力小游戏';
        localStorage.setItem('curRoundScore',0);
        localStorage.setItem('barrier',0);

        function getDescContent() {
            return '我刚刚在玩#3824智力小游戏#中闯关 ' + shareBarrier + ' 关，得分 ' + shareScore + ' 分，小伙伴们赶紧来挑战下吧！';
        }

        function share() {
            function shareFriend() {
                WeixinJSBridge.invoke('sendAppMessage', {
                    "img_url": imgUrl,
                    "img_width": SHARE_IMG_WIDTH,
                    "img_height": SHARE_IMG_HEIGHT,
                    "link": lineLink,
                    "desc": getDescContent(),
                    "title": shareTitle
                }, function (res) {
                    //_report('send_msg', res.err_msg);
                })
            }

            function shareTimeline() {
                WeixinJSBridge.invoke('shareTimeline', {
                    "img_url": imgUrl,
                    "img_width": SHARE_IMG_WIDTH,
                    "img_height": SHARE_IMG_HEIGHT,
                    "link": lineLink,
                    "desc": getDescContent(),
                    "title": getDescContent()
                }, function (res) {
                    //_report('timeline', res.err_msg);
                });
            }

            function shareWeibo() {
                WeixinJSBridge.invoke('shareWeibo', {
                    "content": getDescContent(),
                    "url": lineLink
                }, function (res) {
                });
            }

            // 发送给好友
            WeixinJSBridge.on('menu:share:appmessage', function (argv) {
                shareFriend();
            });
            // 分享到朋友圈
            WeixinJSBridge.on('menu:share:timeline', function (argv) {
                shareTimeline();
            });
            // 分享到微博
            WeixinJSBridge.on('menu:share:weibo', function (argv) {
                shareWeibo();
            });
        }
        if (typeof WeixinJSBridge != 'undefined') {
            share();
        }

        function intersection(target) {
            var nodes = $('#question-area .ball');
            nodes.removeClass('covered');
            for (var i = 0, len = nodes.length; i < len; i++) {
                var node = $(nodes[i]);
                if (target[0] != node[0]) {
                    var tR = target.width(),
                        tCenter = {
                            x: parseInt(target.css('left')) + tR / 2,
                            y: parseInt(target.css('top')) + tR / 2
                        },
                        nR = node.width(),
                        nCenter = {
                            x: parseInt(node.css('left')) + nR / 2,
                            y: parseInt(node.css('top')) + nR / 2
                        };
                    if ((tR / 2 + nR / 2) > Math.sqrt(Math.pow(tCenter.x - nCenter.x, 2) + Math.pow(tCenter.y - nCenter.y, 2))) {
                        return node;
                    }
                }
            }
            return null;
        }

        $('body').on('touchmove', function (e) {
            e.preventDefault();
        }).on('touchstart', '.home-op-list span', function (e) {
            $(this).css('opacity', 0.5);
        }).on('touchend', '.home-op-list span', function (e) {
            $(this).css('opacity', 1);
        }).on('touchend', '.home-op-list span.begin', function (e) {
            location.hash = 'player';
        }).on('touchend', '#player .to-index', function (e) {
            location.hash = 'index';
        }).on('touchstart', '#player .ball', function (e) {
            var $this = $(this);
            var touch = e.originalEvent.touches[0];
            $this.data({
                originalTouch: {pageX: touch.pageX, pageY: touch.pageY},
                left: parseInt($this.css('left')),
                top: parseInt($this.css('top'))
            }).addClass('touched');
        }).on('touchmove', '#player .ball', function (e) {
            var $this = $(this),
                originalTouch,
                touch = e.originalEvent.touches[0];
            if (originalTouch = $this.data('originalTouch')) {
                var left = parseInt($this.data('left')) + (touch.pageX - originalTouch.pageX);
                var top = parseInt($this.data('top')) + (touch.pageY - originalTouch.pageY);
                if (left <= BARRIER_LEFT) {
                    left = BARRIER_LEFT;
                }
                if (left >= BARRIER_RIGHT) {
                    left = BARRIER_RIGHT;
                }
                if (top <= BARRIER_TOP) {
                    top = BARRIER_TOP;
                }
                if (top >= BARRIER_BOTTOM) {
                    top = BARRIER_BOTTOM;
                }
                $this.css({
                    left: left,
                    top: top
                });
                var interNode;
                if (interNode = intersection($this)) {
                    interNode.addClass('covered');
                }
            }
        }).on('touchend', '#player .ball', function (e) {
            var $this = $(this),
                originalTouch,
                touch = e.originalEvent.touches[0],
                interNode;

            if (interNode = intersection($this)) {
                $this.addClass('to-intersection');
                interNode.addClass('covered');
                $this.data('intersection-below', interNode);
                var idx = parseInt(interNode.data('idx')),
                    op = ((idx == 1 || idx == 3) ? '+' : '-'),
                    top = (idx == 1 || idx == 2) ? true : false;
                $this.animate({
                    left: interNode.css('left'),
                    top: interNode.css('top')
                }, function () {
                    var sNum = $this.find('.num').data('num'),
                        tNum = interNode.find('.num').data('num'),
                        sum = sNum + tNum,
                        min = Math.max(sNum, tNum) - Math.min(sNum, tNum),
                        mul = sNum * tNum,
                        div = (sNum % tNum == 0 ? sNum / tNum : (tNum % sNum == 0 ? tNum / sNum : -1)),
                        showResult = [
                            {
                                op: 1,
                                result: sum,
                                left: 0,
                                top: 0
                            }
                        ];
                    if (min != 0) {
                        showResult.push({
                            op: 2,
                            result: min,
                            left: 0,
                            top: 0
                        })
                    }
                    if (mul != sum && mul != min) {
                        showResult.push({
                            op: 3,
                            result: mul,
                            left: 0,
                            top: 0
                        })
                    }
                    if (div > 0 && div != sum && div != min && div != mul) {
                        showResult.push({
                            op: 4,
                            result: div,
                            left: 0,
                            top: 0
                        })
                    }
                    var resultNum = showResult.length;
                    switch (resultNum) {
                        case 1:
                            showResult[0].left = op + CALRESULTGO;
                            break;
                        case 2:
                            var x = Math.cos(Math.PI * (TWO_ANGLE / 2 / 180)) * CALRESULTGO;
                            var y = Math.sin(Math.PI * (TWO_ANGLE / 2 / 180)) * CALRESULTGO;
                            showResult[0].left = op + x;
                            showResult[0].top = -y;
                            showResult[1].left = op + x;
                            showResult[1].top = y;
                            break;
                        case 3:
                            var angle = 30;
                            if (top) {
                                var x1 = Math.cos(Math.PI * (angle / 180)) * CALRESULTGO;
                                var y1 = Math.sin(Math.PI * (angle / 180)) * CALRESULTGO;
                                showResult[0].left = op + x1;
                                showResult[0].top = -y1;
                                var x2 = Math.cos(Math.PI * ((THREE_ANGLE - angle) / 180)) * CALRESULTGO;
                                var y2 = Math.sin(Math.PI * ((THREE_ANGLE - angle) / 180)) * CALRESULTGO;
                                showResult[1].left = op + x2;
                                showResult[1].top = y2;
                                var x3 = Math.cos(Math.PI * ((THREE_ANGLE * 2 - angle) / 180)) * CALRESULTGO;
                                var y3 = Math.sin(Math.PI * ((THREE_ANGLE * 2 - angle) / 180)) * CALRESULTGO;
                                showResult[2].left = op + x3;
                                showResult[2].top = y3;
                            } else {
                                var x3 = Math.cos(Math.PI * (angle / 180)) * CALRESULTGO;
                                var y3 = Math.sin(Math.PI * (angle / 180)) * CALRESULTGO;
                                showResult[2].left = op + x3;
                                showResult[2].top = y3;
                                var x2 = Math.cos(Math.PI * ((THREE_ANGLE - angle) / 180)) * CALRESULTGO;
                                var y2 = Math.sin(Math.PI * ((THREE_ANGLE - angle) / 180)) * CALRESULTGO;
                                showResult[1].left = op + x2;
                                showResult[1].top = -y2;
                                var x1 = Math.cos(Math.PI * ((THREE_ANGLE * 2 - angle) / 180)) * CALRESULTGO;
                                var y1 = Math.sin(Math.PI * ((THREE_ANGLE * 2 - angle) / 180)) * CALRESULTGO;
                                showResult[0].left = op + x1;
                                showResult[0].top = -y1;
                            }
                            break;
                        case 4:
                            var angle = 15;

                            if (top) {
                                var x1 = Math.cos(Math.PI * (angle / 180)) * CALRESULTGO;
                                var y1 = Math.sin(Math.PI * (angle / 180)) * CALRESULTGO;
                                showResult[0].left = op + x1;
                                showResult[0].top = -y1;
                                var x2 = Math.cos(Math.PI * ((FOUR_ANGLE - angle) / 180)) * CALRESULTGO;
                                var y2 = Math.sin(Math.PI * ((FOUR_ANGLE - angle) / 180)) * CALRESULTGO;
                                showResult[1].left = op + x2;
                                showResult[1].top = y2;
                                var x3 = Math.cos(Math.PI * ((FOUR_ANGLE * 2 - angle) / 180)) * CALRESULTGO;
                                var y3 = Math.sin(Math.PI * ((FOUR_ANGLE * 2 - angle) / 180)) * CALRESULTGO;
                                showResult[2].left = op + x3;
                                showResult[2].top = y3;
                                var x4 = Math.sin(Math.PI * ((angle) / 180)) * CALRESULTGO;
                                var y4 = Math.cos(Math.PI * ((angle) / 180)) * CALRESULTGO;
                                showResult[3].left = (op == '-' ? '+' : '-') + x4;
                                showResult[3].top = y4;
                            } else {
                                var x4 = Math.cos(Math.PI * (angle / 180)) * CALRESULTGO;
                                var y4 = Math.sin(Math.PI * (angle / 180)) * CALRESULTGO;
                                showResult[3].left = op + x4;
                                showResult[3].top = y4;
                                var x3 = Math.cos(Math.PI * ((FOUR_ANGLE - angle) / 180)) * CALRESULTGO;
                                var y3 = Math.sin(Math.PI * ((FOUR_ANGLE - angle) / 180)) * CALRESULTGO;
                                showResult[2].left = op + x3;
                                showResult[2].top = -y3;
                                var x2 = Math.cos(Math.PI * ((FOUR_ANGLE * 2 - angle) / 180)) * CALRESULTGO;
                                var y2 = Math.sin(Math.PI * ((FOUR_ANGLE * 2 - angle) / 180)) * CALRESULTGO;
                                showResult[1].left = op + x2;
                                showResult[1].top = -y2;
                                var x1 = Math.sin(Math.PI * ((angle) / 180)) * CALRESULTGO;
                                var y1 = Math.cos(Math.PI * ((angle) / 180)) * CALRESULTGO;
                                showResult[0].left = (op == '-' ? '+' : '-') + x1;
                                showResult[0].top = -y1;
                            }
                            break;
                        default :
                            break;
                    }
                    var combineNode = $this.clone();
                    combineNode
                        .addClass('to-combine')
                        .css({
                            left: $this.offset().left,
                            top: $this.offset().top
                        });
                    $.each(showResult, function (idx, el) {
                        combineNode.prepend(
                            $('<span></span>')
                                .addClass('cal-result').addClass('cal-result-' + el.op)
                                .append(
                                $('<i></i>').text(el.result)
                            ).data('posInfo', el)
                        )
                    });

                    $('.mask').empty().append(combineNode).show();
                    $('.cal-result').each(function (idx, el) {
                        el = $(el);
                        var posInfo = el.data('posInfo');
                        $(el).css({
                            left: parseInt(el.css('left')) + parseInt(posInfo.left),
                            top: parseInt(el.css('top')) + parseInt(posInfo.top)
                        })
                    });
                });
            } else {
                $this.animate({
                    left: $this.data('left'),
                    top: $this.data('top')
                }, function () {
                    $this.removeClass('touched');
                });
            }
        }).on('touchend', '.cal-result', function (e) {
            var $this = $(this),
                posInfo = $this.data('posInfo'),
                result = posInfo.result,
                idx = parseInt($this.parents('.to-combine').data('idx')),
                newNode = $('#question-area').find('[data-idx="' + idx + '"]'),
                intersectionBelow = newNode.data('intersection-below');

            newNode
                .removeClass('touched')
                .removeClass('to-intersection')
                .removeClass('covered')
                .find('.num')
                .data('num', result)
                .text(result);
            if (intersectionBelow) {
                newNode.data('intersection-below', false);
                intersectionBelow.remove();
                newNode.attr('data-idx', intersectionBelow.data('idx'));
            }
            $('.mask').empty().hide();
            var balls = $('#player .balls .ball');
            if (balls.length === 2) {
                var ball1Num = $(balls[0]).find('.num').data('num'),
                    ball2Num = $(balls[1]).find('.num').data('num');
                var sum = ball1Num + ball2Num;
                var min = Math.max(ball1Num, ball2Num) - Math.min(ball1Num, ball2Num);
                var mul = ball1Num * ball2Num;
                var div = Math.max(ball1Num, ball2Num) / Math.min(ball1Num, ball2Num);
                if (sum == 24 || min == 24 || mul == 24 || div == 24) {
                    localStorage.setItem('barrier', barrier);
                    var scores = summaryScore();
                    var playerPanel = $('#player');
                    if ((playerPanel.find('.success-info').show()).length < 1) {
                        playerPanel.append(successTpl)
                    }
                    var maxBarrier = localStorage.getItem('maxBarrier') || 0;
                    if (barrier > maxBarrier) {
                        localStorage.setItem('maxBarrier', barrier);
                    }
                    playerPanel
                        .find('#question-area,.btm-op,.failure-info')
                        .hide()
                        .end()
                        .find('.success-info .cur-score')
                        .text(scores.curBarrierScore)
                        .end()
                        .find('.success-info .total-score em')
                        .text(scores.curRoundScore);
                    shareBarrier = barrier;
                    shareScore = scores.curRoundScore;
                }
            }
        }).on('touchend', '#player .btm-op .help', function (e) {
            $('.mask').empty().html(helpPanelTpl).show();
        }).on('touchend', '#player .btm-op .restart', function (e) {
            generateNums($('#player'), curQuestion);
        }).on('touchend', '.i-know', function (e) {
            $('.mask').empty().hide();
        }).on('touchend', '#player .next-question', function (e) {
            barrier++;
            var playerPanel = $('#player');
            generateNums(playerPanel);
            playerPanel
                .find('#question-area,.btm-op')
                .show()
                .end()
                .find('.success-info,.failure-info')
                .hide();
            resetInterval();
        }).on('touchend', '#player .goon-game', function (e) {
            var playerPanel = $('#player');
            generateNums(playerPanel);
            playerPanel
                .find('#question-area,.btm-op')
                .show()
                .end()
                .find('.success-info,.failure-info')
                .hide();
            resetInterval();
        }).on('touchend', '#index .my-score', function (e) {
            shareBarrier = localStorage.getItem('maxBarrier');
            shareScore = localStorage.getItem('historyHighestScore');
            location.hash = 'best_score';
        }).on('touchstart','.op-list .go-home,.op-list .share',function(e) {
            var $this = $(this);
            $this.css('opacity',0.5);
        }).on('touchend','.op-list .go-home',function(e) {
            var $this = $(this);
            $this.css('opacity',1);
            location.hash = '';
        }).on('touchend','.op-list .share',function(e) {
            var $this = $(this);
            $this.css('opacity',1);
            $('.mask').css('background-color','rgba(50,50,50,0.9)').empty().append(shareTipTpl).show();
            setTimeout(function(){
                $('.mask').css('background-color','').hide();
            },3000);
        });

        function updateBarrierTip(barrier) {
            $('#player .barrier-num').text(barrier);
        }

        function summaryScore() {
            clearInterval(timeTickInterval);
            var curBarrierScore = parseInt($('.time-tip').data('remainderTime'));
            localStorage.setItem('curBarrierScore', curBarrierScore);
            var curRoundScore = (parseInt(localStorage.getItem('curRoundScore')) || 0) + curBarrierScore;
            localStorage.setItem('curRoundScore', curRoundScore);
            var historyHighestScore = (parseInt(localStorage.getItem('historyHighestScore')) || 0);
            localStorage.setItem('historyHighestScore', Math.max(historyHighestScore, curRoundScore));
            return {
                curBarrierScore: curBarrierScore,
                curRoundScore: curRoundScore,
                historyHighestScore: historyHighestScore
            }
        }

        var timeTickInterval,
            timeTick = function () {
                var timeTip = $('.time-tip'),
                    timeTipWidth = $('body').width() - 20,
                    remainderTime = timeTip.data('remainderTime') || TOTAL_TIME_IN_SECONDS,
                    toWidth = 0;

                remainderTime--;
                timeTip.data('remainderTime', remainderTime);
                toWidth = (TOTAL_TIME_IN_SECONDS - remainderTime) / TOTAL_TIME_IN_SECONDS * timeTipWidth;
                timeTip.find('.elapsed-time')
                    .css('width', toWidth)
                    .end().find('.tick')
                    .css('left', Math.max(toWidth - TICK_WIDTH, 0));

                $('.remainder-time').text('00:' + (remainderTime < 10 ? '0' + remainderTime : remainderTime));
                if (remainderTime <= 0) {
                    var scores = summaryScore();
                    var playerPanel = $('#player');
                    var failureInfo = playerPanel.find('.failure-info').show();
                    if (failureInfo.length < 1) {
                        failureInfo = $(failureTpl).appendTo(playerPanel);
                    }

                    playerPanel.find('#question-area,.btm-op,.success-info')
                        .hide();
                    failureInfo
                        .find('.answer .tip')
                        .text(curQuestion.result || '')
                        .end()
                        .find('.cur-round-score em')
                        .text(scores.curRoundScore)
                        .end()
                        .find('.highest-score em')
                        .text(scores.historyHighestScore);

                    barrier = 1;
                    localStorage.setItem('barrier', barrier);
                    localStorage.setItem('curRoundScore', 0);
                }
            };

        function resetInterval() {
            clearInterval(timeTickInterval);
            $('.time-tip').data('remainderTime', TOTAL_TIME_IN_SECONDS);
            $('.remainder-time').text('00:60');
            timeTickInterval = setInterval(timeTick, 1000);
        }

        function createQuestion() {
            if (!playerPanel) {
                playerPanel = $(playerTpl);
            }
            playerPanel
                .find('#question-area,.btm-op')
                .show()
                .end()
                .find('.success-info,.failure-info')
                .hide();
            generateNums(playerPanel);
            return playerPanel;
        }

        function generateNums(playerPanel, wantedQuestion) {
            if (allNums.length === 0) {
                allNums = calculate_num.all_nums_group();
                allNumLen = allNums.length;
            }
            updateBarrierTip(barrier);
            var idx = parseInt(Math.random() * allNumLen),
                question = wantedQuestion || allNums[idx],
                nums = question.num;
            curQuestion = question;
            var questionArea = playerPanel.find('#question-area');
            questionArea.html(questionTpl);
            questionArea.find('.ball.left-top .num').data('num', nums[0]).text(nums[0]).end()
                .find('.ball.right-top .num').data('num', nums[1]).text(nums[1]).end()
                .find('.ball.left-bottom .num').data('num', nums[2]).text(nums[2]).end()
                .find('.ball.right-bottom .num').data('num', nums[3]).text(nums[3]);
        }

        var AppRoute = Backbone.Router.extend({
            routes: {
                '': 'index',
                'index': 'index',
                'player': 'player',
                'best_score': 'bestScore'
            },
            index: function () {
                pageslider.slidePage($(indexTpl));
            },
            player: function () {
                pageslider.slidePage(createQuestion());
//                barrier = parseInt(localStorage.getItem('barrier') || 0) + 1;
                updateBarrierTip(barrier);
                resetInterval();
            },
            bestScore: function () {
                var bestScore = $(bestScoreTpl),
                    score = localStorage.getItem('historyHighestScore') || 0,
                    maxBarrier = localStorage.getItem('maxBarrier') || 0;
                bestScore.find('.score').text(score).end().find('.barrier-num em').text(maxBarrier);
                pageslider.slidePage(bestScore);
            }
        });
        var route = new AppRoute();
        Backbone.history.start();
    };
    return {
        init: execute
    }
});