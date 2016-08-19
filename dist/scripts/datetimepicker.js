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
		//获取当前年的农历年份
		var lunarYear = LunarDate.GetLunarDay(self.currYear, self.currMonth, self.currDate).split(" ")[0];
		//创建头部底层容器
		$(containerObj).append("\n\t\t\t<div class=\"headYearMonth\">\n\t\t\t\t<div class=\"switchBtn\">&lt;&lt;</div>\n\t\t\t\t<div class=\"switchBtn\">&lt;</div>\n\t\t\t\t<div class=\"yearShow show\">" + self.currYear + "年 " + lunarYear + "</div>\n\t\t\t\t<div class=\"monthShow show\">" + self.currMonth + "月</div>\n\t\t\t\t<div class=\"switchBtn\">&gt;</div>\n\t\t\t\t<div class=\"switchBtn\">&gt;&gt;</div>\n\t\t\t</div>\n\t\t\t");
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
					//更新calendar对象信息
					self.currYear = previousYear;
					//获取当前年的农历年份
					var _lunarYear = LunarDate.GetLunarDay(self.currYear, self.currMonth, self.currDate).split(" ")[0];
					$(".yearShow").html(previousYear + "年 " + _lunarYear);

					//刷新日期面板
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
								self.currYear = _nextYear;
								//获取当前年的农历年份
								var _lunarYear2 = LunarDate.GetLunarDay(self.currYear, self.currMonth, self.currDate).split(" ")[0];
								$(".yearShow").html(_nextYear + "年 " + _lunarYear2);

								//刷新日期面板
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
				self.createDateInfo(blankPanel).createBtnInfo(blankPanel);
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
			//计算当前日期的阴历对应日期
			var lunarRes = LunarDate.GetLunarDay(this.currYear, this.currMonth, _start);
			var lunarMonth = lunarRes.split(" ")[1].split("月")[0];
			var lunarDate = lunarRes.split(" ")[1].split("月")[1];
			//定义要显示的农历信息，每个月初一显示月份，遇到节日则显示节日
			var specialDate = Util.calSpecialDate("" + this.currMonth + _start, lunarMonth + "月" + lunarDate);
			var showRes = void 0;
			if (specialDate["isSpec"]) {
				showRes = specialDate["specDate"];
			} else if (!specialDate["isSpec"] && lunarDate === "初一") {
				showRes = lunarMonth + "月";
			} else {
				showRes = lunarDate;
			}
			//用当前的年月日拼接为2011/1/1这种字符串，然后判断其是否为禁止选择的日期
			var targetStr = this.currYear + "/" + this.currMonth + "/" + _start;
			//如果为禁用字符串的话
			if (this.initConfig["not-allow-selected"].indexOf(targetStr) > -1) {
				var dateInfo = document.createElement("div");
				//如果是当前天的话
				if (specialDate["isSpec"]) {
					$(docFragment).append("\n\t\t\t\t\t\t<div class=\"dateInfo currMonthDate specialDate not-allow-selected\">" + _start + "<span class=\"lunarDate\">" + showRes + "</span></div>\n\t\t\t\t\t\t");
				} else if (!specialDate["isSpec"] && this.currDate == _start) {
					$(docFragment).append("\n\t\t\t\t\t\t<div class=\"dateInfo currMonthDate currDate not-allow-selected\">" + _start + "<span class=\"lunarDate\">" + showRes + "</span></div>\n\t\t\t\t\t\t");
				} else {
					$(docFragment).append("\n\t\t\t\t\t\t<div class=\"dateInfo currMonthDate not-allow-selected\">" + _start + "<span class=\"lunarDate\">" + showRes + "</span></div>\n\t\t\t\t\t\t");
				}
			}
			//如果不是禁用字符串的话
			else {
					if (specialDate["isSpec"]) {
						$(docFragment).append("\n\t\t\t\t\t\t<div class=\"dateInfo currMonthDate specialDate\">" + _start + "<span class=\"lunarDate\">" + showRes + "</span></div>\n\t\t\t\t\t\t");
					} else if (!specialDate["isSpec"] && this.currDate == _start) {
						$(docFragment).append("\n\t\t\t\t\t\t<div class=\"dateInfo currMonthDate currDate\">" + _start + "<span class=\"lunarDate\">" + showRes + "</span></div>\n\t\t\t\t\t\t");
					} else {
						$(docFragment).append("\n\t\t\t\t\t\t<div class=\"dateInfo currMonthDate\">" + _start + "<span class=\"lunarDate\">" + showRes + "</span></div>\n\t\t\t\t\t\t");
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
							currActiveObj.className += " dateZoomStyle";
							//指针指向下一个对象
							currActiveObj = currActiveObj.nextElementSibling;
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
							if (!self.initConfig["dateZoom"]) {
								self.createDateInfo($(".blankPanel")[0]).createTimeInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
							} else {
								self.createDateInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
							}
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
								if (!self.initConfig["dateZoom"]) {
									self.createDateInfo($(".blankPanel")[0]).createTimeInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
								} else {
									self.createDateInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
								}
							}
							//点击到本月的日期
							else {
									if ("Y-M-D" === self.date_type) {
										self.currDate = this.innerHTML.match(/^\d+/g)[0];
										self.currMonth = $(".monthShow").html().match(/^\d+/g)[0];
										self.currYear = $(".yearShow").html().match(/^\d+/g)[0];

										//先移除已经有此类的，然后给点击元素添加类
										$(".currSingleDate").removeClass("currSingleDate");
										this.className += " currSingleDate";
									} else if ("Y-M-D-H-Mi" === self.date_type || "Memo" === self.date_type) {
										self.currDate = this.innerHTML.match(/^\d+/g)[0];
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
								document.getElementById("datetimepicker").firstElementChild.value = self.currYear + "年" + self.currMonth + "月" + self.firstClickDate.innerHTML.match(/^\d+/g)[0] + "日 到 " + self.currYear + "年" + self.currMonth + "月" + self.secondClickDate.innerHTML.match(/^\d+/g)[0] + "日";
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
		//每次调用之前，首先初始化时间
		self.currTime = {
			"hour": "00",
			"minute": "00",
			"second": "00"
		};
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

				var offsetLeft = e.clientX - this.clientLeft + $(".blankPanel")[0].clientLeft;
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
			//获取当前年的农历年份
			var lunarYear = LunarDate.GetLunarDay(self.currYear, self.currMonth, self.currDate).split(" ")[0];
			//更改年份显示
			$(".yearShow").html(self.currYear + "年 " + lunarYear);
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
		var fixedLength = 382;

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
	},
	calSpecialDate: function calSpecialDate(YaLdate, YiLdate) {
		//先声明一个Generater函数
		/*function* objectEntries(){
  	let propkeys = Object.keys(this);
  	for(let propkey of propkeys){
  		yield [propkey,this[propkey]];
  	}
  }*/

		var resObj = { "isSpec": false, "specDate": {} };

		var YaLSpecDate = { "11": "元旦", "38": "妇女节", "51": "劳动节", "61": "儿童节", "71": "建党节", "81": "建军节", "101": "国庆节", "1225": "圣诞节" };
		var YiLSpecDate = { "正月初一": "春节", "正月十五": "元宵节", "五月初五": "端午节", "七月十五": "中元节", "八月十五": "中秋节", "九月初九": "重阳节" };
		//部署iterator接口
		/*YaLSpecDate[Symbol.iterator] = objectEntries;
  YiLSpecDate[Symbol.iterator] = objectEntries;
  for(let [key,value] of YaLSpecDate){
  	if(key === YaLdate){
  		resObj["isSpec"] = true;
  		resObj["specDate"] = value;
  		break;
  	}
  }
  for(let [key,value] of YiLSpecDate){
  	if(key === YiLdate){
  		resObj["isSpec"] = true;
  		resObj["specDate"] = value;
  		break;
  	}
  }*/
		for (var key_YaL in YaLSpecDate) {
			if (YaLdate === key_YaL) {
				resObj["isSpec"] = true;
				resObj["specDate"] = YaLSpecDate[key_YaL];
				break;
			}
		}
		for (var key_YiL in YiLSpecDate) {
			if (YiLdate === key_YiL) {
				resObj["isSpec"] = true;
				resObj["specDate"] = YiLSpecDate[key_YiL];
				break;
			}
		}
		return resObj;
	}
};
'use strict';

var LunarDate = {
    madd: new Array(0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334),
    HsString: '甲乙丙丁戊己庚辛壬癸',
    EbString: '子丑寅卯辰巳午未申酉戌亥',
    NumString: "一二三四五六七八九十",
    MonString: "正二三四五六七八九十冬腊",
    CalendarData: new Array(0xA4B, 0x5164B, 0x6A5, 0x6D4, 0x415B5, 0x2B6, 0x957, 0x2092F, 0x497, 0x60C96, 0xD4A, 0xEA5, 0x50DA9, 0x5AD, 0x2B6, 0x3126E, 0x92E, 0x7192D, 0xC95, 0xD4A, 0x61B4A, 0xB55, 0x56A, 0x4155B, 0x25D, 0x92D, 0x2192B, 0xA95, 0x71695, 0x6CA, 0xB55, 0x50AB5, 0x4DA, 0xA5B, 0x30A57, 0x52B, 0x8152A, 0xE95, 0x6AA, 0x615AA, 0xAB5, 0x4B6, 0x414AE, 0xA57, 0x526, 0x31D26, 0xD95, 0x70B55, 0x56A, 0x96D, 0x5095D, 0x4AD, 0xA4D, 0x41A4D, 0xD25, 0x81AA5, 0xB54, 0xB6A, 0x612DA, 0x95B, 0x49B, 0x41497, 0xA4B, 0xA164B, 0x6A5, 0x6D4, 0x615B4, 0xAB6, 0x957, 0x5092F, 0x497, 0x64B, 0x30D4A, 0xEA5, 0x80D65, 0x5AC, 0xAB6, 0x5126D, 0x92E, 0xC96, 0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, 0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95),
    Year: null,
    Month: null,
    Day: null,
    TheDate: null,
    GetBit: function GetBit(m, n) {
        return m >> n & 1;
    },
    e2c: function e2c() {
        this.TheDate = arguments.length != 3 ? new Date() : new Date(arguments[0], arguments[1], arguments[2]);
        var total, m, n, k;
        var isEnd = false;
        var tmp = this.TheDate.getFullYear();
        total = (tmp - 1921) * 365 + Math.floor((tmp - 1921) / 4) + this.madd[this.TheDate.getMonth()] + this.TheDate.getDate() - 38;
        if (this.TheDate.getYear() % 4 == 0 && this.TheDate.getMonth() > 1) {
            total++;
        }
        for (m = 0;; m++) {
            k = this.CalendarData[m] < 0xfff ? 11 : 12;
            for (n = k; n >= 0; n--) {
                if (total <= 29 + this.GetBit(this.CalendarData[m], n)) {
                    isEnd = true;
                    break;
                }
                total = total - 29 - this.GetBit(this.CalendarData[m], n);
            }
            if (isEnd) break;
        }
        this.Year = 1921 + m;
        this.Month = k - n + 1;
        this.Day = total;
        if (k == 12) {
            if (this.Month == Math.floor(this.CalendarData[m] / 0x10000) + 1) {
                this.Month = 1 - this.Month;
            }
            if (this.Month > Math.floor(this.CalendarData[m] / 0x10000) + 1) {
                this.Month--;
            }
        }
    },
    GetcDateString: function GetcDateString() {
        var tmp = "";
        tmp += this.HsString.charAt((this.Year - 4) % 10);
        tmp += this.EbString.charAt((this.Year - 4) % 12);
        tmp += "年 ";
        if (this.Month < 1) {
            tmp += "(闰)";
            tmp += this.MonString.charAt(-this.Month - 1);
        } else {
            tmp += this.MonString.charAt(this.Month - 1);
        }
        tmp += "月";
        tmp += this.Day < 11 ? "初" : this.Day < 20 ? "十" : this.Day < 30 ? "廿" : "三十";
        if (this.Day % 10 != 0 || this.Day == 10) {
            tmp += this.NumString.charAt((this.Day - 1) % 10);
        }
        return tmp;
    },
    GetLunarDay: function GetLunarDay(solarYear, solarMonth, solarDay) {
        if (solarYear < 1921 || solarYear > 2020) {
            return "";
        } else {
            solarMonth = parseInt(solarMonth) > 0 ? solarMonth - 1 : 11;
            this.e2c(solarYear, solarMonth, solarDay);
            return this.GetcDateString();
        }
    }
};
//# sourceMappingURL=datetimepicker.js.map
