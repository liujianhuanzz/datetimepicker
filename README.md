# datetimepicker

**本项目的最终目的是实现一个功能比较丰富的日历插件。**

本项目的实现方式采用jQuery的插件形式，通过一个立即执行函数表达式传入$后为其添加datetimepicker方法

**datetimepicker期望实现：**

1. 可以通过其触发元素的自定义属性来配置其类型，初步想法为两种，“Y-M-D”和“Y-M-D-H-Mi”两种类型，针对不同的类型做不同的处理。
2. 可以初始化配置一些类型，比如可以指定默认日期，指定不可以选择或者操作的日期
3. 针对“Y-M-D-H-Mi”类型的时间选择方面，通过两种方式实现，一种为数字选择型，一种为拖动选择型


# API 实例 #

## 1. “Y-M-D”型 ##

**code**

    <div id="datetimepicker" date-type="Y-M-D"></div>
    <script type="text/javascript">
    	$.datetimepicker("#datetimepicker");
    </script>

其中`id`为`datetimepicker`的`div`为触发日期选择的触发元素，`date-type`为触发元素的自定义属性，配置日期选择的展示类型。

结果如图：

![](http://i.imgur.com/gaLbsbl.png)

（未完待续）