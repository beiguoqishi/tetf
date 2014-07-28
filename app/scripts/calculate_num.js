define('calculate_num',[],function() {
    function cal(a, b, opr) {
        if (opr == 0)
            return a + b;
        else if (opr == 1)
            return a - b;
        else if (opr == 2)
            return a * b;
        else if (opr == 3)
            return a / b;

        return 0;
    }

    function convert(opr) {
        if (opr == 0)
            return "+";
        else if (opr == 1)
            return "-";
        else if (opr == 2)
            return "*";
        else if (opr == 3)
            return "/";

        return "";
    }

//condition为0，表示是（1+2+5）*3这种情况；为1表示是（1+2）*（3+5）这种情况
    function result(can1, op1, can2, op2, can3, op3, can4, condition) {
        var state1 = false;
        var state2 = false;
        var tmp1_left="";
        var tmp1_right="";
        var tmp2_left="";
        var tmp2_right="";
        if(condition == 0)
        {
            if(op1 <= 1 && op2 >= 2)
                state1 = true;
            if(op2 <= 1 && op3 >= 2)
                state2 = true;
            if(state1)
            {
                tmp1_left = "(";
                tmp1_right = ")";
            }
            if(state2)
            {
                tmp2_left = "(";
                tmp2_right = ")";
            }

            return (tmp2_left + tmp1_left + can1 + convert(op1) + can2 + tmp1_right + convert(op2) + can3 + tmp2_right + convert(op3) + can4);
        }
        else
        {
            if(op1 <= 1 && op2 >= 2)
                state1 = true;
            //if(op3 <= 1 && op2 >= 2)
            //state2 = true;
            if(state1)
            {
                tmp1_left = "(";
                tmp1_right = ")";
            }
            /*if(state2)
             {
             tmp2_left = "(";
             tmp2_right = ")";
             }*/
            return (tmp1_left + can1 + convert(op1) + can2 + tmp1_right + convert(op2) + "(" + can3 + convert(op3) + can4 + ")");
        }
    }

//判断一组数是否可以组成24点，并把结果字符串返回
    function getResult(can) {
        var result1 = 0;
        var result2 = 0;
        var result3 = 0;

        //i、j、k分别表示这三个操作符
        for (var i = 0; i < 4; i++)
            for (var j = 0; j < 4; j++)
                for (var k = 0; k < 4; k++) {
                    result1 = cal(can[0], can[1], i);
                    //判断中间数是否为整数（如果用其它语言写的话，这一块可能要改）
                    if ((i == 3 && result1 != parseInt(result1)) || result1 <= 0)
                        continue;
                    result2 = cal(result1, can[2], j);
                    if ((j == 3 && result2 != parseInt(result2)) || result2 <= 0)
                        continue;
                    result3 = cal(result2, can[3], k);
                    if ((k == 3 && result3 != parseInt(result3)))
                        continue;

                    if (result3 == 24)
                        return result(can[0], i, can[1], j, can[2], k, can[3], 0);
                }

        return "0";
    }

    function getResult2(can)
    {
        var result1 = 0;	//左边的结果
        var result2 = 0;	//右边的结果
        var result3 = 0;		//最后运算结果

        for(var i = 0;i < 4;i++)
            for(var j = 0;j < 4;j++)
                for(var k = 0;k < 4;k++)
                {
                    result1 = cal(can[0], can[1], i);
                    if ((i == 3 && result1 != parseInt(result1)) || result1 <= 0)
                        continue;
                    result2 = cal(can[2], can[3], k);
                    if ((k == 3 && result2 != parseInt(result2)) || result2 <= 0)
                        continue;
                    result3 = cal(result1, result2, j);
                    if ((j == 3 && result3 != parseInt(result3)))
                        continue;
                    if(result3 == 24)
                        return result(can[0], i, can[1], j, can[2], k, can[3], 1);
                }

        return "0";
    }

    function all_nums_group() {
        var allNums = [];
        var can = [0, 0, 0, 0];
        var res = "0";
        for (can[0] = 1; can[0] <= 9; can[0]++)
            for (can[1] = 1; can[1] <= 9; can[1]++)
                for (can[2] = 1; can[2] <= 9; can[2]++)
                    for (can[3] = 1; can[3] <= 9; can[3]++) {
                        res = "0";
                        res = getResult(can);
                        if(res == "0")
                            res = getResult2(can);	//不符合第一种情况的话，判断是否符合第二种情况

                        if (res != '0') {
                            allNums.push({
                                num: [can[0],can[1],can[2],can[3]],
                                result: res
                            })
                        }
                    }
        return allNums;
    }
    return {
        all_nums_group:all_nums_group
    }
});
