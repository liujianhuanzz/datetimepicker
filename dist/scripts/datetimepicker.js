"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function ($) {
	$.datetimepicker = function (selector) {
		var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		//定义一个初始化配置对象
		var initConfig = {};
		initConfig["not-allow-selected"] = config["not-allow-selected"] || [];
		initConfig["dateZoom"] = config["dateZoom"] || false;
		initConfig["memo-callback"] = config["memo-callback"];

		$(selector).children().on("click", function (e) {
			//阻止事件冒泡
			e.stopPropagation();
			e.preventDefault();
			//this = $(selector)[0];
			//获取日历展示方式
			var date_type = this.parentNode.getAttribute("date-type");
			//提示用户当前的日期选择方式
			if (initConfig["dateZoom"]) {
				alert("当前为日期区间选择，请正确操作");
			} else if (date_type === "Memo") {
				alert("当前为备忘类型，请正确操作");
			} else {
				alert("当前为单日期选择，请正确操作");
			}

			//获取当前日期
			var now = new Date();
			//不加时间的日历
			if ("Y-M-D" === date_type) {
				new Calender(now, date_type, initConfig).createBlankPanel(this.parentNode).createHeadInfo($(".blankPanel")[0]).createDateInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
			}
			//加时间的日历
			else if ("Y-M-D-H-Mi" === date_type) {
					new Calender(now, date_type, initConfig).createBlankPanel(this.parentNode).createHeadInfo($(".blankPanel")[0]).createDateInfo($(".blankPanel")[0]).createTimeInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
				}
				//备忘类型的日历
				else if ("Memo" === date_type) {
						new Calender(now, date_type, initConfig).createBlankPanel(this.parentNode).createHeadInfo($(".blankPanel")[0]).createDateInfo($(".blankPanel")[0]).createTimeInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
					}
		});
	};
})($);

var Calender = function Calender(datetime, date_type, initConfig) {
	this.currYear = datetime.getFullYear();
	this.currMonth = datetime.getMonth() + 1;
	this.currDate = datetime.getDate();
	this.currDay = datetime.getDay();
	this.date_type = date_type;
	this.initConfig = initConfig;
	//如果是选择日期区间，则新添一个属性来记录首尾日期
	if (this.initConfig["dateZoom"]) {
		this.firstClickDate = "";
		this.secondClickDate = "";
	}
	//如果是带时间的日期 且 为日期区间
	if ("Y-M-D-H-Mi" === this.date_type && this.initConfig["dateZoom"]) {
		this.firstClickDate = "";
		this.secondClickDate = "";
		this.firstSelectTime = {
			"hour": "00",
			"minute": "00",
			"second": "00"
		};
		this.secondSelectTime = {
			"hour": "00",
			"minute": "00",
			"second": "00"
		};
	}
	//如果是带时间的日期 且 为单日选择
	else if ("Y-M-D-H-Mi" === this.date_type && !this.initConfig["dateZoom"]) {
			this.currTime = {
				"hour": "00",
				"minute": "00",
				"second": "00"
			};
		}
		//如果是备忘类型
		else if ("Memo" === this.date_type && !this.initConfig["dateZoom"]) {
				this.currTime = {
					"hour": "00",
					"minute": "00",
					"second": "00"
				};
				this.callback = initConfig["memo-callback"];
			}
			//如果是不带时间 且 为日期区间
			else if (!("Y-M-D-H-Mi" === this.date_type) && this.initConfig["dateZoom"]) {
					this.firstClickDate = "";
					this.secondClickDate = "";
				}
};

Calender.prototype = {
	//创建一个空白的底层容器
	createBlankPanel: function createBlankPanel(obj) {
		var self = this;
		//已经有了的话，先移除
		$(".blankPanel").remove();

		$(obj).append("\n\t\t\t<div class=\"blankPanel\" style=\"top:" + $(obj).css("height") + "\"></div>\n\t\t\t");

		return self;
	},
	//创建顶部日期显示区域
	createHeadInfo: function createHeadInfo(containerObj) {
		var self = this;
		//创建头部底层容器
		$(containerObj).append("\n\t\t\t<div class=\"headYearMonth\">\n\t\t\t\t<div class=\"switchBtn\">&lt;&lt;</div>\n\t\t\t\t<div class=\"switchBtn\">&lt;</div>\n\t\t\t\t<div class=\"yearShow show\">" + self.currYear + "年</div>\n\t\t\t\t<div class=\"monthShow show\">" + self.currMonth + "月</div>\n\t\t\t\t<div class=\"switchBtn\">&gt;</div>\n\t\t\t\t<div class=\"switchBtn\">&gt;&gt;</div>\n\t\t\t</div>\n\t\t\t");
		//为年月左右翻页绑定事件
		$(".switchBtn").on("click", function (e) {
			e.stopPropagation();
			e.preventDefault();

			var currAction = this.innerHTML;
			//<<
			if ("&lt;&lt;" === currAction) {
				self.removeInit();
				//获取当前显示的年份
				var currShowYear = $(".yearShow").html();
				//判断改变年份还是年区间
				var index = currShowYear.indexOf("-");
				if (index > -1) {
					//年区间翻页
					var initYear = parseInt(currShowYear.split("-")[0]) - 12;
					self.createYearPanel($(".blankPanel")[0], initYear);
				} else {
					var previousYear = parseInt(currShowYear) - 1;
					$(".yearShow").html(previousYear + "年");

					//刷新日期面板
					//更新calendar对象信息
					self.currYear = previousYear;
					//
					reviseDateInfo();
				}
			}
			//<
			else if ("&lt;" === currAction) {
					//如果被禁用了则不可点击
					if (this.className.indexOf("not-allow-selected") === -1) {
						self.removeInit();
						//获取当前显示的月份
						var currShowMonth = $(".monthShow").html();
						//判断改变月份
						var previousMonth = parseInt(currShowMonth) - 1;
						//如果preiviousMonth为0的话，上一年的最后一个月
						if (0 === previousMonth) {
							//获取当前显示的年份
							var _currShowYear = $(".yearShow").html();
							//改为上一年
							var _previousYear = parseInt(_currShowYear) - 1;
							$(".yearShow").html(_previousYear + "年");

							previousMonth = 12;
							//更新calendar对象信息
							self.currMonth = previousMonth;
							self.currYear = _previousYear;
						}
						$(".monthShow").html(previousMonth + "月");
						//刷新日期面板
						self.currMonth = previousMonth;
						//
						reviseDateInfo();
						//self.createDateInfo($(".blankPanel")[0]);
					}
				}
				//>
				else if ("&gt;" === currAction) {
						if (this.className.indexOf("not-allow-selected") === -1) {
							self.removeInit();
							//获取当前显示的月份
							var _currShowMonth = $(".monthShow").html();
							//判断改变月份
							var nextMonth = parseInt(_currShowMonth) + 1;

							//如果preiviousMonth为13的话，下一年的第一个月
							if (13 === nextMonth) {
								//获取当前显示的年份
								var _currShowYear2 = $(".yearShow").html();
								//改为下一年
								var nextYear = parseInt(_currShowYear2) + 1;
								$(".yearShow").html(nextYear + "年");

								nextMonth = 1;
								//更新calendar对象信息
								self.currMonth = nextMonth;
								self.currYear = nextYear;
							}

							$(".monthShow").html(nextMonth + "月");
							//刷新日期面板
							//
							self.currMonth = nextMonth;

							reviseDateInfo();
							//self.createDateInfo($(".blankPanel")[0]);
						}
					}
					//>>
					else {
							self.removeInit();
							//获取当前显示的年份
							var _currShowYear3 = $(".yearShow").html();
							//判断改变年份还是年区间
							var _index = _currShowYear3.indexOf("-");
							if (_index > -1) {
								//年区间翻页
								var _initYear = parseInt(_currShowYear3.split("-")[0]) + 12;
								self.createYearPanel($(".blankPanel")[0], _initYear);
							} else {
								var _nextYear = parseInt(_currShowYear3) + 1;
								$(".yearShow").html(_nextYear + "年");

								//刷新日期面板
								self.currYear = _nextYear;
								//
								reviseDateInfo();
							}
						}
		});

		//为年、月显示绑定事件
		$(".show").on("click", function (e) {
			e.stopPropagation();
			e.preventDefault();

			self.removeInit();

			//禁用月份翻页
			var pageBtn = $(".switchBtn");
			[].concat(_toConsumableArray(pageBtn)).forEach(function (item) {
				if (item.innerHTML === "&lt;" || item.innerHTML === "&gt;") {
					item.className += " not-allow-selected";
				}
			});

			//点击年份
			if (this.className.indexOf("yearShow") > -1 && this.innerHTML.indexOf("年") > -1) {
				var initYear = parseInt(self.currYear) - 7;
				self.createYearPanel($(".blankPanel")[0], initYear);
			}
			//点击月份
			else {
					self.createMonthPanel($(".blankPanel")[0]);
				}
		});

		function reviseDateInfo() {
			var blankPanel = $(".blankPanel")[0];
			if (self.date_type === 'Y-M-D') {
				self.createDateInfo(blankPanel);
			} else {
				self.createDateInfo(blankPanel).createTimeInfo(blankPanel).createBtnInfo(blankPanel);
			}
		}

		return self;
	},
	//创建星期几显示区域和日期显示区域
	createDateInfo: function createDateInfo(containerObj) {
		var self = this;
		self.removeInit();

		//创建星期几显示区域
		var dayArr = ['日', '一', '二', '三', '四', '五', '六'];
		//创建星期几容器
		$(containerObj).append("\n\t\t\t<div class=\"dayContainer\"></div>\n\t\t\t");
		//创建星期几信息
		var dayContainer = $(".dayContainer")[0];
		var docFragment = document.createDocumentFragment();
		for (var index = 0, len = dayArr.length; index < len; index++) {
			$(docFragment).append("\n\t\t\t\t<div class=\"dayInfo\">" + dayArr[index] + "</div>\n\t\t\t\t");
		}
		$(dayContainer).append(docFragment);

		//创建日期容器
		$(containerObj).append("\n\t\t\t<div class=\"dateContainer\"></div>\n\t\t\t");

		//创建日期信息
		//首先判断当前月份有几天，函数在util中
		var sumCurrDate = Util.howManyDate(this.currYear, this.currMonth);
		//判断上个月有几天
		var sumPrevDate = Util.howManyDate(this.currYear, this.currMonth - 1);
		//计算本月的第一天为星期几
		var firstDay = new Date(this.currYear + "/" + this.currMonth + "/" + 1).getDay();

		//添加本页中可显示的上月日期
		var dateContainer = $(".dateContainer")[0];
		docFragment = document.createDocumentFragment();
		for (var start = sumPrevDate - firstDay + 1; start <= sumPrevDate; start++) {
			$(docFragment).append("\n\t\t\t\t<div class=\"prevMonthDate dateInfo\">" + start + "</div>\n\t\t\t\t");
		}
		$(dateContainer).append(docFragment);

		//添加本页中可显示的本月日期
		docFragment = document.createDocumentFragment();
		for (var _start = 1; _start <= sumCurrDate; _start++) {
			//用当前的年月日拼接为2011/1/1这种字符串，然后判断其是否为禁止选择的日期
			var targetStr = this.currYear + "/" + this.currMonth + "/" + _start;
			//如果为禁用字符串的话
			if (this.initConfig["not-allow-selected"].indexOf(targetStr) > -1) {
				var dateInfo = document.createElement("div");
				//如果是当前天的话
				if (this.currDate == _start) {
					$(docFragment).append("\n\t\t\t\t\t\t<div class=\"dateInfo currDate not-allow-selected\">" + _start + "</div>\n\t\t\t\t\t\t");
				} else {
					$(docFragment).append("\n\t\t\t\t\t\t<div class=\"dateInfo not-allow-selected\">" + _start + "</div>\n\t\t\t\t\t\t");
				}
			}
			//如果不是禁用字符串的话
			else {
					if (this.currDate == _start) {
						$(docFragment).append("\n\t\t\t\t\t\t<div class=\"currMonthDate dateInfo currDate\">" + _start + "</div>\n\t\t\t\t\t\t");
					} else {
						$(docFragment).append("\n\t\t\t\t\t\t<div class=\"currMonthDate dateInfo\">" + _start + "</div>\n\t\t\t\t\t\t");
					}
				}
		}
		$(dateContainer).append(docFragment);

		//添加本页中可显示的下个月日期
		//首先获取本月最后一天为星期几
		docFragment = document.createDocumentFragment();
		var lastDay = new Date(this.currYear + "/" + this.currMonth + "/" + sumCurrDate).getDay();
		if (lastDay !== 6) {
			for (var _start2 = 1; _start2 <= 6 - lastDay; _start2++) {
				$(docFragment).append("\n\t\t\t\t\t<div class=\"nextMonthDate dateInfo\">" + _start2 + "</div>\n\t\t\t\t\t");
			}
			$(dateContainer).append(docFragment);
		}

		//为日期添加点击事件
		$(".dateInfo").on("click", function (e) {
			e.stopPropagation();
			e.preventDefault();
			if (this.className.indexOf("not-allow-selected") === -1) {
				//日期区间选择
				if (self.initConfig["dateZoom"]) {
					//self.firstClickDate为空的话说明是第一次点击
					if (!self.firstClickDate) {
						self.firstClickDate = this;
						this.className += " dateZoomStyle";
					} else {
						self.secondClickDate = this;

						var currActiveObj = self.firstClickDate;
						//循环执行改变颜色
						while (true) {
							//为当前活跃对象添加样式类
							//指针指向下一个对象
							currActiveObj = currActiveObj.nextSibling;
							currActiveObj.className += " dateZoomStyle";
							//如果为禁止选择的日期
							if (currActiveObj.className.indexOf("not-allow-selected") > -1) {
								currActiveObj = currActiveObj.nextSibling;
							}
							//如果为第二次点击的日期
							else if (currActiveObj.innerHTML == self.secondClickDate.innerHTML) {
									currActiveObj.className += " dateZoomStyle";
									break;
								}
						}
					}
				}
				//单日期选择
				else {
						//点击到上个月的日期
						if (this.className.indexOf("prevMonthDate") > -1) {
							//获取当前显示的月份
							var currShowMonth = $(".monthShow").html();
							//判断改变月份
							var previousMonth = parseInt(currShowMonth) - 1;
							//如果preiviousMonth为0的话，上一年的最后一个月
							if (0 === previousMonth) {
								//获取当前显示的年份
								var currShowYear = $(".yearShow").html();
								//改为上一年
								var previousYear = parseInt(currShowYear) - 1;
								$(".yearShow").html(previousYear + "年");

								previousMonth = 12;
								//更新calendar对象信息
								self.currMonth = previousMonth;
								self.currYear = previousYear;
							}
							$(".monthShow").html(previousMonth + "月");
							//刷新日期面板
							self.currMonth = previousMonth;
							//
							self.createDateInfo($(".blankPanel")[0]);
						}
						//点击到下个月的日期
						else if (this.className.indexOf("nextMonthDate") > -1) {
								//获取当前显示的月份
								var _currShowMonth2 = $(".monthShow").html();
								//判断改变月份
								var nextMonth = parseInt(_currShowMonth2) + 1;

								//如果preiviousMonth为13的话，下一年的第一个月
								if (13 === nextMonth) {
									//获取当前显示的年份
									var _currShowYear4 = $(".yearShow").html();
									//改为下一年
									var nextYear = parseInt(_currShowYear4) + 1;
									$(".yearShow").html(nextYear + "年");

									nextMonth = 1;
									//更新calendar对象信息
									self.currMonth = nextMonth;
									self.currYear = nextYear;
								}

								$(".monthShow").html(nextMonth + "月");
								//刷新日期面板
								//
								self.currMonth = nextMonth;
								self.createDateInfo($(".blankPanel")[0]);
							}
							//点击到本月的日期
							else {
									if ("Y-M-D" === self.date_type) {
										self.currDate = this.innerHTML;
										self.currMonth = $(".monthShow").html().match(/^\d+/g)[0];
										self.currYear = $(".yearShow").html().match(/^\d+/g)[0];

										//先移除已经有此类的，然后给点击元素添加类
										$(".currSingleDate").removeClass("currSingleDate");
										this.className += " currSingleDate";
									} else if ("Y-M-D-H-Mi" === self.date_type || "Memo" === self.date_type) {
										self.currDate = this.innerHTML;
										self.currMonth = $(".monthShow").html().match(/^\d+/g)[0];
										self.currYear = $(".yearShow").html().match(/^\d+/g)[0];

										//先移除已经有此类的，然后给点击元素添加类
										$(".currSingleDate").removeClass("currSingleDate");
										this.className += " currSingleDate";
									}
								}
					}
			}
		});

		return self;
	},
	//创建确认和取消按钮
	createBtnInfo: function createBtnInfo(containerObj) {
		var self = this;
		//添加确认和取消按钮
		$(containerObj).append("\n\t\t\t<div class=\"btnContainer\">\n\t\t\t\t<div class=\"btn submitBtn\">确认</div>\n\t\t\t\t<div class=\"btn cancelBtn\">取消</div>\n\t\t\t</div>\n\t\t\t");

		//为确认和取消按钮添加事件
		$(".btn").on("click", function (e) {
			e.stopPropagation();
			e.preventDefault();

			var btnFlag = this.className.indexOf("submitBtn");
			//如果是确认按钮 同时不是备忘类型日历
			if (btnFlag > -1 && self.date_type !== "Memo") {
				//如果是单日期选择  不带时间
				if (!self.initConfig["dateZoom"] && !("Y-M-D-H-Mi" === self.date_type)) {
					document.getElementById("datetimepicker").firstElementChild.value = self.currYear + "年" + self.currMonth + "月" + self.currDate + "日";
					$(".blankPanel").remove();
				}
				//单日期  带时间
				else if (!self.initConfig["dateZoom"] && "Y-M-D-H-Mi" === self.date_type) {
						document.getElementById("datetimepicker").firstElementChild.value = self.currYear + "年" + self.currMonth + "月" + self.currDate + "日" + self.currTime["hour"] + "时" + self.currTime["minute"] + "分" + self.currTime["second"] + "秒";
						$(".blankPanel").remove();
					}
					//如果是日期区间选择
					else {
							//首先判断用户是否点击了第二次
							if (!self.secondClickDate) {
								alert("当前为日期区间选择，请选择结束日期");
							} else {
								document.getElementById("datetimepicker").firstElementChild.value = self.currYear + "年" + self.currMonth + "月" + self.firstClickDate.innerHTML + "日 到 " + self.currYear + "年" + self.currMonth + "月" + self.secondClickDate.innerHTML + "日";
								$(".blankPanel").remove();
							}
						}
			}
			//确认按钮  同时 是备忘类型
			else if (btnFlag > -1 && self.date_type === "Memo") {
					//备忘窗口不存在则添加
					if ($(".memoDiv")[0] === undefined) {
						$(this).append("\n\t\t\t\t\t\t<div class=\"memoDiv\"></div>\n\t\t\t\t\t\t");
						//es6模板字符串特性
						$(".memoDiv").append("\n\t\t\t\t\t\t<form method=\"post\">\n\t\t\t\t\t\t\t<label for=\"memoTime\">时间：<input type=\"text\" name=\"memoTime\" value=\"" + (self.currYear + "年" + self.currMonth + "月" + self.currDate + "日" + self.currTime["hour"] + "时" + self.currTime["minute"] + "分" + self.currTime["second"] + "秒") + "\"></label>\n\t\t\t\t\t\t\t<label for=\"memoAddress\">地点：<input type=\"text\" name=\"memoAddress\" placeholder=\"必填项\" required></label>\n\t\t\t\t\t\t\t<label for=\"memoTheme\">主题：<input type=\"text\" name=\"memoTheme\" placeholder=\"必填项\" required></label>\n\t\t\t\t\t\t\t<label for=\"memoSubmit\"><input type=\"submit\" name=\"memoSubmit\" value=\"提交\"></label>\n\t\t\t\t\t\t</form>");
						//表单提交事件
						$("input[type='submit']").on("click", function (e) {
							e.stopPropagation();
							e.preventDefault();

							var memoInfo = $(".memoDiv form").serializeArray();
							self.callback(memoInfo);
							$(".blankPanel").remove();
						});
					}
				}
				//如果是取消按钮
				else {
						$(".blankPanel").remove();
					}
		});
		return self;
	},
	//创建时间区域
	createTimeInfo: function createTimeInfo(containerObj) {
		var self = this;
		//如果是区间日期选择，则不添加时间选择功能
		if (!self.initConfig["dateZoom"]) {
			//创建时间信息容器
			$(containerObj).append("\n\t\t\t\t<div class=\"timeContainer\">\n\t\t\t\t\t<div class=\"timeShow\">\n\t\t\t\t\t\t<span class=\"hourShow\">" + self.currTime["hour"] + "</span>:\n\t\t\t\t\t\t<span class=\"minuteShow\">" + self.currTime["minute"] + "</span>:\n\t\t\t\t\t\t<span class=\"secondShow\">" + self.currTime["second"] + "</span>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t");

			var timeContainer = $(".timeContainer")[0];
			var docFragment = document.createDocumentFragment();
			for (var i = 0; i < 3; i++) {
				//创建滑动选择时间的固定横轴和移动块
				$(docFragment).append("\n\t\t\t\t\t<div class=\"timeFixedDiv\">\n\t\t\t\t\t\t<div class=\"timeMovedDiv\"></div>\n\t\t\t\t\t</div>\n\t\t\t\t\t");
			}
			$(timeContainer).append(docFragment);

			//为固定横轴写点击事件
			$(".timeFixedDiv").on("click", function (e) {
				e.stopPropagation();
				e.preventDefault();

				var offsetLeft = e.clientX - this.clientLeft;
				var index = [].concat(_toConsumableArray($(".timeMovedDiv"))).indexOf(this.firstElementChild);
				//计算小时值
				if (index === 0) {
					var hour = Util.calculateTime(offsetLeft, 'hour');
					$(".hourShow").html(hour);
					//更改Calender对象中的时间属性
					self.currTime["hour"] = hour;
				}
				//计算分钟值
				else if (index === 1) {
						var minute = Util.calculateTime(offsetLeft, 'minute');
						$(".minuteShow").html(minute);
						//更改Calender对象中的时间属性
						self.currTime["minute"] = minute;
					}
					//计算秒钟值
					else if (index === 2) {
							var second = Util.calculateTime(offsetLeft, 'second');
							$(".secondShow").html(second);
							//更改Calender对象中的时间属性
							self.currTime["second"] = second;
						}
				//更改滑块的位置
				$(this.firstElementChild).css("left", offsetLeft + "px");
			});

			//为滑块绑定滑动事件
			$(".timeMovedDiv").draggable({
				'axis': "x",
				'containment': ".timeFixedDiv",
				drag: function drag(events, ui) {
					var currMovedEle = ui.helper[0]; //当前拖动元素
					var allMovedELe = $(".timeMovedDiv"); //所有可拖动的元素
					var offsetLeft = currMovedEle.offsetLeft; //偏移父元素左端的距离
					var index = [].concat(_toConsumableArray(allMovedELe)).indexOf(currMovedEle);
					//根据其父元素是否具有上下兄弟节点来判断其改变的是时分秒
					//计算小时值
					if (index === 0) {
						var hour = Util.calculateTime(offsetLeft, 'hour');
						$(".hourShow").html(hour);
						//更改Calender对象中的时间属性
						self.currTime["hour"] = hour;
					}
					//计算分钟值
					else if (index === 1) {
							var minute = Util.calculateTime(offsetLeft, 'minute');
							$(".minuteShow").html(minute);
							//更改Calender对象中的时间属性
							self.currTime["minute"] = minute;
						}
						//计算秒钟值
						else if (index === 2) {
								var second = Util.calculateTime(offsetLeft, 'second');
								$(".secondShow").html(second);
								//更改Calender对象中的时间属性
								self.currTime["second"] = second;
							}
				}
			});
		}
		return self;
	},
	//创建年选择面板
	createYearPanel: function createYearPanel(containerObj, initYear) {
		var self = this;
		self.removeInit();
		//创建年份面板容器
		$(containerObj).append("\n\t\t\t<div class=\"yearSelectContainer\"></div>\n\t\t\t");
		var yearSelectContainer = $(".yearSelectContainer")[0];
		var docFragment = document.createDocumentFragment();
		//创建显示
		for (var i = initYear; i < initYear + 12; i++) {
			$(docFragment).append("\n\t\t\t\t<div class=\"eachYearEle\">" + i + "</div>\n\t\t\t\t");
		}
		$(yearSelectContainer).append(docFragment);

		//更改年份展示区域
		$(".yearShow").html(initYear + "--" + (initYear + 11));

		//绑定点击事件
		$(".eachYearEle").on("click", function (e) {
			e.stopPropagation();
			e.preventDefault();
			//更改Calendar对象属性
			self.currYear = parseInt(this.innerHTML);
			//生成月份
			self.createMonthPanel($(".blankPanel")[0]);
			//更改年份显示
			$(".yearShow").html(self.currYear + "年");
		});
		return self;
	},
	//创建月份选择面板
	createMonthPanel: function createMonthPanel(containerObj) {
		var self = this;
		self.removeInit();

		//创建月份面板容器
		$(containerObj).append("\n\t\t\t<div class=\"monthSelectContainer\"></div>\n\t\t\t");
		var monthSelectContainer = $(".monthSelectContainer")[0];
		var docFragment = document.createDocumentFragment();
		//创建显示
		for (var i = 0; i < 12; i++) {
			$(docFragment).append("\n\t\t\t\t<div class=\"eachMonthEle\">" + (i + 1) + "月</div>\n\t\t\t\t");
		}
		$(monthSelectContainer).append(docFragment);

		//绑定点击事件
		$(".eachMonthEle").on("click", function () {
			var e = arguments.length <= 0 || arguments[0] === undefined ? window.events : arguments[0];

			e.stopPropagation();
			e.preventDefault();
			//更改Calendar对象属性
			self.currMonth = parseInt(this.innerHTML.match(/^\d+/g)[0]);
			//生成日期信息
			var blankPanel = $(".blankPanel")[0];
			self.createDateInfo(blankPanel).createTimeInfo(blankPanel).createBtnInfo(blankPanel);
			//更改月份显示
			$(".monthShow").html(self.currMonth + "月");
			//释放月份翻页的禁用状态
			$(".switchBtn.not-allow-selected").removeClass("not-allow-selected");
		});
		return self;
	},
	//移除
	removeInit: function removeInit() {
		//先移除日期面板
		$(".dayContainer,.dateContainer,.timeContainer,.btnContainer,.yearSelectContainer,.monthSelectContainer").remove();
	}
};

var Util = {
	//计算每个月有几天
	howManyDate: function howManyDate(year, month) {
		if (month == 0) {
			year = year - 1;
			month = 12;
		}
		//计算每个月有几天,此处对2000年这种不做判断，觉得我们应该活不到下一次了
		if (!(year % 4)) {
			//二月闰
			switch (month) {
				case 1:
					return 31;
					break;
				case 3:
					return 31;
					break;
				case 5:
					return 31;
					break;
				case 7:
					return 31;
					break;
				case 8:
					return 31;
					break;
				case 10:
					return 31;
					break;
				case 12:
					return 31;
					break;
				case 4:
					return 30;
					break;
				case 6:
					return 30;
					break;
				case 9:
					return 30;
					break;
				case 11:
					return 30;
					break;
				case 2:
					return 29;
					break;
			}
		} else {
			//二月平
			switch (month) {
				case 1:
					return 31;
					break;
				case 3:
					return 31;
					break;
				case 5:
					return 31;
					break;
				case 7:
					return 31;
					break;
				case 8:
					return 31;
					break;
				case 10:
					return 31;
					break;
				case 12:
					return 31;
					break;
				case 4:
					return 30;
					break;
				case 6:
					return 30;
					break;
				case 9:
					return 30;
					break;
				case 11:
					return 30;
					break;
				case 2:
					return 29;
					break;
			}
		}
	},
	calculateTime: function calculateTime(offsetLeft, type) {
		var fixedLength = 242;

		if ("hour" === type) {
			var result = Math.floor(23 * offsetLeft / fixedLength) + "";
			if (result.length === 1) {
				result = "0" + result;
			}
			return result;
		} else if ("minute" === type) {
			var _result = Math.floor(59 * offsetLeft / fixedLength) + "";
			if (_result.length === 1) {
				_result = "0" + _result;
			}
			return _result;
		} else if ("second" === type) {
			var _result2 = Math.floor(59 * offsetLeft / fixedLength) + "";
			if (_result2.length === 1) {
				_result2 = "0" + _result2;
			}
			return _result2;
		}
	}
};
//# sourceMappingURL=datetimepicker.js.map
