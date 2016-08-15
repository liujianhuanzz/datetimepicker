# datetimepicker

**本项目的最终目的是实现一个功能比较丰富的日历插件。**

本项目的实现方式采用jQuery的插件形式，通过一个立即执行函数表达式传入$后为其添加datetimepicker方法

**datetimepicker期望实现：**

1. 可以通过其触发元素的自定义属性来配置其类型，初步想法为两种，“Y-M-D”和“Y-M-D-H-Mi”两种类型，针对不同的类型做不同的处理。
2. 可以初始化配置禁止选中的日期，和配置日期选择方式，是单日期选择还是日期区间选择；
2. 可以初始化配置一些类型，比如可以指定默认日期，指定不可以选择或者操作的日期
3. 针对“Y-M-D-H-Mi”类型的时间选择方面，通过拖动选择型实现

# 操作图示 #

![](http://i.imgur.com/iZHUPCz.png)

# API 实例 #

## 1. “Y-M-D”型 ##

**code**

    <div id="datetimepicker" date-type="Y-M-D"></div>
    <script type="text/javascript">
    	$.datetimepicker("#datetimepicker"[,option]);
    </script>

其中`id`为`datetimepicker`的`div`为触发日期选择的触发元素，`date-type`为触发元素的自定义属性，配置日期选择的展示类型。

`$.datetimepicker("#datetimepicker",{"not-allow-selected":['2015/8/4','2016/8/4'],"dateZoom":false})`为调用方法，其中`datetimepicker`为关联触发元素的选择器，必选项。第二个参数为初始化配置对象，为可选项，默认为**无不可选日期**和**单日期选择**，其中`not-allow-selected`为默认不可选中的日期数组，`dateZoom`设置为`true`，可以选择日期区间，设置为`false`，只可以选择单日期。

结果如图：

    <div id="datetimepicker" date-type="Y-M-D"></div>
    <script type="text/javascript">
    	$.datetimepicker("#datetimepicker");
    </script>

![](http://i.imgur.com/gaLbsbl.png)


----------


默认不可选中的日期结果如图：

	<div id="datetimepicker" date-type="Y-M-D"></div>
	<script type="text/javascript">
		$.datetimepicker("#datetimepicker",{"not-allow-selected":['2016/8/4'],"dateZoom":false});
	</script>

![](http://i.imgur.com/Ceje0Pf.png)


----------


日期区间选择（不含默认被选中日期）结果如图（目前仅支持本月内日期区间选择，本人觉得跨月选择还是两次唤起日历较好，而且从操作上也差不多）：

	<div id="datetimepicker" date-type="Y-M-D"></div>
	<script type="text/javascript">
		$.datetimepicker("#datetimepicker",{"not-allow-selected":['2016/8/4'],"dateZoom":true});
	</script>

![](http://i.imgur.com/7cNavZs.png)


----------


日期区间选择（含默认被选中日期）结果如图：

	<div id="datetimepicker" date-type="Y-M-D"></div>
	<script type="text/javascript">
		$.datetimepicker("#datetimepicker",{"not-allow-selected":['2016/8/4'],"dateZoom":false});
	</script>

![](http://i.imgur.com/P1FZtYd.png)


----------

## 2. “Y-M-D-H-Mi”型 ##

**code**

    <div id="datetimepicker" date-type="Y-M-D-H-Mi"></div>
    <script type="text/javascript">
    	$.datetimepicker("#datetimepicker"[,option]);
    </script>

其中`id`为`datetimepicker`的`div`为触发日期选择的触发元素，`date-type`为触发元素的自定义属性，配置日期选择的展示类型。

`$.datetimepicker("#datetimepicker",{"not-allow-selected":['2015/8/4','2016/8/4']})`为调用方法，其中`datetimepicker`为关联触发元素的选择器，必选项。第二个参数为初始化配置对象，为可选项，默认为**无不可选日期**和**单日期选择**，其中`not-allow-selected`为默认不可选中的日期数组,在“Y-M-D-H-Mi”型下只可以选择单日期年月日时分秒，不可以选择日期区间。

    <div id="datetimepicker" date-type="Y-M-D-H-Mi"></div>
    <script type="text/javascript">
    	$.datetimepicker("#datetimepicker",{"not-allow-selected":['2015/8/4','2016/8/4']});
    </script>

![](http://i.imgur.com/aqC4Vkd.png)


（未完待续）