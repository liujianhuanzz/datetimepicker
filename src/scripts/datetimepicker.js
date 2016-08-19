(function($){
	$.datetimepicker = function(selector,config={}){
		//定义一个初始化配置对象
		let initConfig = {};
		initConfig["not-allow-selected"] = config["not-allow-selected"] || [];
		initConfig["dateZoom"] = config["dateZoom"] || false;
		initConfig["memo-callback"] = config["memo-callback"];

		$(selector).children().on("click",function(e){
			//阻止事件冒泡
			e.stopPropagation();
			e.preventDefault();
			//this = $(selector)[0];
			//获取日历展示方式
			let date_type = this.parentNode.getAttribute("date-type");
			//提示用户当前的日期选择方式
			if(initConfig["dateZoom"]){
				alert("当前为日期区间选择，请正确操作");
			}else if (date_type === "Memo") {
				alert("当前为备忘类型，请正确操作")
			}else{
				alert("当前为单日期选择，请正确操作");
			}

			//获取当前日期
			let now = new Date();
			//不加时间的日历
			if("Y-M-D" === date_type){
				new Calender(now,date_type,initConfig).createBlankPanel(this.parentNode)
								 .createHeadInfo($(".blankPanel")[0])
								 .createDateInfo($(".blankPanel")[0])
								 .createBtnInfo($(".blankPanel")[0]);
			}
			//加时间的日历
			else if("Y-M-D-H-Mi" === date_type){
				new Calender(now,date_type,initConfig).createBlankPanel(this.parentNode)
								 .createHeadInfo($(".blankPanel")[0])
								 .createDateInfo($(".blankPanel")[0])
								 .createTimeInfo($(".blankPanel")[0])
								 .createBtnInfo($(".blankPanel")[0]);
			}
			//备忘类型的日历
			else if ("Memo" === date_type) {
				new Calender(now,date_type,initConfig).createBlankPanel(this.parentNode)
								 .createHeadInfo($(".blankPanel")[0])
								 .createDateInfo($(".blankPanel")[0])
								 .createTimeInfo($(".blankPanel")[0])
								 .createBtnInfo($(".blankPanel")[0]);
			}
		})
	}
})($)

var Calender = function(datetime,date_type,initConfig){
	this.currYear = datetime.getFullYear();
	this.currMonth = datetime.getMonth()+1;
	this.currDate = datetime.getDate();
	this.currDay = datetime.getDay();
	this.date_type = date_type;
	this.initConfig = initConfig;
	//如果是选择日期区间，则新添一个属性来记录首尾日期
	if(this.initConfig["dateZoom"]){
		this.firstClickDate = "";
		this.secondClickDate = "";
	}
	//如果是带时间的日期 且 为日期区间
	if(("Y-M-D-H-Mi" === this.date_type)&&(this.initConfig["dateZoom"])){
		this.firstClickDate = "";
		this.secondClickDate = "";
		this.firstSelectTime = {
			"hour":"00",
			"minute":"00",
			"second":"00"
		};
		this.secondSelectTime = {
			"hour":"00",
			"minute":"00",
			"second":"00"
		};
	}
	//如果是带时间的日期 且 为单日选择
	else if(("Y-M-D-H-Mi" === this.date_type)&&!(this.initConfig["dateZoom"])){
		this.currTime = {
			"hour":"00",
			"minute":"00",
			"second":"00"
		};
	}
	//如果是备忘类型
	else if(("Memo" === this.date_type)&&!(this.initConfig["dateZoom"])){
		this.currTime = {
			"hour":"00",
			"minute":"00",
			"second":"00"
		};
		this.callback = initConfig["memo-callback"];
	}
	//如果是不带时间 且 为日期区间
	else if(!("Y-M-D-H-Mi" === this.date_type)&&(this.initConfig["dateZoom"])){
		this.firstClickDate = "";
		this.secondClickDate = "";
	}
};

Calender.prototype = {
	//创建一个空白的底层容器
	createBlankPanel:function(obj){
		let self = this;
		//已经有了的话，先移除
		$(".blankPanel").remove();

		$(obj).append(`
			<div class="blankPanel" style="top:${$(obj).css("height")}"></div>
			`)

		return self;
	},
	//创建顶部日期显示区域
	createHeadInfo:function(containerObj){
		let self = this;
		//获取当前年的农历年份
		let lunarYear = LunarDate.GetLunarDay(self.currYear,self.currMonth,self.currDate).split(" ")[0];
		//创建头部底层容器
		$(containerObj).append(`
			<div class="headYearMonth">
				<div class="switchBtn">&lt;&lt;</div>
				<div class="switchBtn">&lt;</div>
				<div class="yearShow show">${self.currYear}年 ${lunarYear}</div>
				<div class="monthShow show">${self.currMonth}月</div>
				<div class="switchBtn">&gt;</div>
				<div class="switchBtn">&gt;&gt;</div>
			</div>
			`)
		//为年月左右翻页绑定事件
		$(".switchBtn").on("click",function(e){
			e.stopPropagation();
			e.preventDefault();

			let currAction = this.innerHTML;
			//<<
			if("&lt;&lt;" === currAction){
				self.removeInit();
				//获取当前显示的年份
				let currShowYear = $(".yearShow").html();
				//判断改变年份还是年区间
				let index = currShowYear.indexOf("-");
				if(index > -1){
					//年区间翻页
					let initYear = parseInt(currShowYear.split("-")[0]) - 12;
					self.createYearPanel($(".blankPanel")[0],initYear);
				}else{
					let previousYear = parseInt(currShowYear) - 1;
					//更新calendar对象信息
					self.currYear = previousYear;
					//获取当前年的农历年份
					let lunarYear = LunarDate.GetLunarDay(self.currYear,self.currMonth,self.currDate).split(" ")[0];
					$(".yearShow").html(previousYear + "年 "+lunarYear);

					//刷新日期面板
					reviseDateInfo();
				}
			}
			//<
			else if("&lt;" === currAction){
				//如果被禁用了则不可点击
				if(this.className.indexOf("not-allow-selected") === -1){
					self.removeInit();
					//获取当前显示的月份
					let currShowMonth = $(".monthShow").html();
					//判断改变月份
					let previousMonth = parseInt(currShowMonth) - 1;
					//如果preiviousMonth为0的话，上一年的最后一个月
					if(0 === previousMonth){
						//获取当前显示的年份
						let currShowYear = $(".yearShow").html();
						//改为上一年
						let previousYear = parseInt(currShowYear) - 1;
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
					reviseDateInfo();
					//self.createDateInfo($(".blankPanel")[0]);
				}
			}
			//>
			else if("&gt;" === currAction){
				if(this.className.indexOf("not-allow-selected") === -1){
					self.removeInit();
					//获取当前显示的月份
					let currShowMonth = $(".monthShow").html();
					//判断改变月份
					let nextMonth = parseInt(currShowMonth) + 1;

					//如果preiviousMonth为13的话，下一年的第一个月
					if(13 === nextMonth){
						//获取当前显示的年份
						let currShowYear = $(".yearShow").html();
						//改为下一年
						let nextYear = parseInt(currShowYear) + 1;
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
				let currShowYear = $(".yearShow").html();
				//判断改变年份还是年区间
				let index = currShowYear.indexOf("-");
				if(index > -1){
					//年区间翻页
					let initYear = parseInt(currShowYear.split("-")[0]) + 12;
					self.createYearPanel($(".blankPanel")[0],initYear);
				}else{
					let nextYear = parseInt(currShowYear) + 1;
					self.currYear = nextYear;
					//获取当前年的农历年份
					let lunarYear = LunarDate.GetLunarDay(self.currYear,self.currMonth,self.currDate).split(" ")[0];
					$(".yearShow").html(nextYear + "年 " +lunarYear);

					//刷新日期面板
					reviseDateInfo();
				}
			}
		})

		//为年、月显示绑定事件
		$(".show").on("click",function(e){
			e.stopPropagation();
			e.preventDefault();

			self.removeInit();

			//禁用月份翻页
			let pageBtn = $(".switchBtn");
			[...pageBtn].forEach((item)=>{
				if(item.innerHTML === "&lt;" || item.innerHTML === "&gt;"){
					item.className += " not-allow-selected";
				}
			})

			//点击年份
			if(this.className.indexOf("yearShow") > -1 && this.innerHTML.indexOf("年") > -1){
				let initYear = parseInt(self.currYear) - 7;
				self.createYearPanel($(".blankPanel")[0],initYear);
			}
			//点击月份
			else{
				self.createMonthPanel($(".blankPanel")[0]);
			}
		})

		function reviseDateInfo(){
			let blankPanel = $(".blankPanel")[0];
			if(self.date_type === 'Y-M-D'){
				self.createDateInfo(blankPanel).createBtnInfo(blankPanel);
			}else{
				self.createDateInfo(blankPanel).createTimeInfo(blankPanel).createBtnInfo(blankPanel);
			}
		}

		return self;
	},
	//创建星期几显示区域和日期显示区域
	createDateInfo:function(containerObj){
		let self = this;
		self.removeInit();

		//创建星期几显示区域
		let dayArr = ['日','一','二','三','四','五','六'];
		//创建星期几容器
		$(containerObj).append(`
			<div class="dayContainer"></div>
			`);
		//创建星期几信息
		let dayContainer = $(".dayContainer")[0];
		let docFragment = document.createDocumentFragment();
		for(let index=0, len = dayArr.length; index < len; index++){
			$(docFragment).append(`
				<div class="dayInfo">${dayArr[index]}</div>
				`);
		}
		$(dayContainer).append(docFragment);

		//创建日期容器
		$(containerObj).append(`
			<div class="dateContainer"></div>
			`);

		//创建日期信息
		//首先判断当前月份有几天，函数在util中
		let sumCurrDate = Util.howManyDate(this.currYear,this.currMonth);
		//判断上个月有几天
		let sumPrevDate = Util.howManyDate(this.currYear,this.currMonth-1);
		//计算本月的第一天为星期几
		let firstDay = new Date(this.currYear+"/"+this.currMonth+"/"+1).getDay();

		//添加本页中可显示的上月日期
		let dateContainer = $(".dateContainer")[0];
		docFragment = document.createDocumentFragment();
		for(let start = (sumPrevDate - firstDay+1); start <= sumPrevDate;start++){
			$(docFragment).append(`
				<div class="prevMonthDate dateInfo">${start}</div>
				`);
		}
		$(dateContainer).append(docFragment);

		//添加本页中可显示的本月日期
		docFragment = document.createDocumentFragment();
		for(let start=1; start<=sumCurrDate;start++){
			//计算当前日期的阴历对应日期
			let lunarRes = LunarDate.GetLunarDay(this.currYear,this.currMonth,start);
			let lunarMonth = lunarRes.split(" ")[1].split("月")[0];
			let lunarDate = lunarRes.split(" ")[1].split("月")[1];
			//定义要显示的农历信息，每个月初一显示月份，遇到节日则显示节日
			let specialDate = Util.calSpecialDate(""+this.currMonth+start,lunarMonth+"月"+lunarDate);
			let	showRes;
			if(specialDate["isSpec"]){
				showRes = specialDate["specDate"];
			}else if(!specialDate["isSpec"] && lunarDate === "初一"){
				showRes = lunarMonth+"月";
			}else {
				showRes = lunarDate;
			}
			//用当前的年月日拼接为2011/1/1这种字符串，然后判断其是否为禁止选择的日期
			let targetStr = this.currYear+"/"+this.currMonth+"/"+start;
			//如果为禁用字符串的话
			if(this.initConfig["not-allow-selected"].indexOf(targetStr) > -1){
				let dateInfo = document.createElement("div");
				//如果是当前天的话
				if(specialDate["isSpec"]){
					$(docFragment).append(`
						<div class="dateInfo currMonthDate specialDate not-allow-selected">${start}<span class="lunarDate">${showRes}</span></div>
						`);
				}else if(!specialDate["isSpec"] && this.currDate == start){
					$(docFragment).append(`
						<div class="dateInfo currMonthDate currDate not-allow-selected">${start}<span class="lunarDate">${showRes}</span></div>
						`);
				}else{
					$(docFragment).append(`
						<div class="dateInfo currMonthDate not-allow-selected">${start}<span class="lunarDate">${showRes}</span></div>
						`);
				}
			}
			//如果不是禁用字符串的话
			else{
				if(specialDate["isSpec"]){
					$(docFragment).append(`
						<div class="dateInfo currMonthDate specialDate">${start}<span class="lunarDate">${showRes}</span></div>
						`);
				}else if(!specialDate["isSpec"] && this.currDate == start){
					$(docFragment).append(`
						<div class="dateInfo currMonthDate currDate">${start}<span class="lunarDate">${showRes}</span></div>
						`);
				}else{
					$(docFragment).append(`
						<div class="dateInfo currMonthDate">${start}<span class="lunarDate">${showRes}</span></div>
						`);
				}
			}
		}
		$(dateContainer).append(docFragment);

		//添加本页中可显示的下个月日期
		//首先获取本月最后一天为星期几
		docFragment = document.createDocumentFragment();
		let lastDay = new Date(this.currYear+"/"+this.currMonth+"/"+sumCurrDate).getDay();
		if(lastDay !== 6){
			for(let start=1; start <= (6 - lastDay); start++){
				$(docFragment).append(`
					<div class="nextMonthDate dateInfo">${start}</div>
					`);
			}
			$(dateContainer).append(docFragment);
		}

		//为日期添加点击事件
		$(".dateInfo").on("click",function(e){
			e.stopPropagation();
			e.preventDefault();
			if(this.className.indexOf("not-allow-selected") === -1){
				//日期区间选择
				if(self.initConfig["dateZoom"]){
					//self.firstClickDate为空的话说明是第一次点击
					if(!self.firstClickDate){
						self.firstClickDate = this;
						this.className += " dateZoomStyle";
					}else{
						self.secondClickDate = this;

						let currActiveObj = self.firstClickDate;
						//循环执行改变颜色
						while(true){
							//为当前活跃对象添加样式类
							currActiveObj.className += " dateZoomStyle";
							//指针指向下一个对象
							currActiveObj = currActiveObj.nextElementSibling;
							//如果为禁止选择的日期
							if(currActiveObj.className.indexOf("not-allow-selected") > -1){
								currActiveObj = currActiveObj.nextSibling;
							}
							//如果为第二次点击的日期
							else if(currActiveObj.innerHTML == self.secondClickDate.innerHTML){
								currActiveObj.className += " dateZoomStyle";
								break;
							}
						}
					}
				}
				//单日期选择
				else{
					//点击到上个月的日期
					if(this.className.indexOf("prevMonthDate") > -1){
						//获取当前显示的月份
						let currShowMonth = $(".monthShow").html();
						//判断改变月份
						let previousMonth = parseInt(currShowMonth) - 1;
						//如果preiviousMonth为0的话，上一年的最后一个月
						if(0 === previousMonth){
							//获取当前显示的年份
							let currShowYear = $(".yearShow").html();
							//改为上一年
							let previousYear = parseInt(currShowYear) - 1;
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
						if(!self.initConfig["dateZoom"]){
							self.createDateInfo($(".blankPanel")[0]).createTimeInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
						}else {
							self.createDateInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
						}
					}
					//点击到下个月的日期
					else if(this.className.indexOf("nextMonthDate") > -1){
						//获取当前显示的月份
						let currShowMonth = $(".monthShow").html();
						//判断改变月份
						let nextMonth = parseInt(currShowMonth) + 1;

						//如果preiviousMonth为13的话，下一年的第一个月
						if(13 === nextMonth){
							//获取当前显示的年份
							let currShowYear = $(".yearShow").html();
							//改为下一年
							let nextYear = parseInt(currShowYear) + 1;
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
						if(!self.initConfig["dateZoom"]){
							self.createDateInfo($(".blankPanel")[0]).createTimeInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
						}else {
							self.createDateInfo($(".blankPanel")[0]).createBtnInfo($(".blankPanel")[0]);
						}
					}
					//点击到本月的日期
					else{
						if("Y-M-D" === self.date_type){
							self.currDate = this.innerHTML.match(/^\d+/g)[0];
							self.currMonth = $(".monthShow").html().match(/^\d+/g)[0];
							self.currYear = $(".yearShow").html().match(/^\d+/g)[0];

							//先移除已经有此类的，然后给点击元素添加类
							$(".currSingleDate").removeClass("currSingleDate");
							this.className += " currSingleDate";
						}
						else if("Y-M-D-H-Mi" === self.date_type || "Memo" === self.date_type){
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
		})

		return self;
	},
	//创建确认和取消按钮
	createBtnInfo:function(containerObj){
		let self = this;
		//添加确认和取消按钮
		$(containerObj).append(`
			<div class="btnContainer">
				<div class="btn submitBtn">确认</div>
				<div class="btn cancelBtn">取消</div>
			</div>
			`);

		//为确认和取消按钮添加事件
		$(".btn").on("click",function(e){
			e.stopPropagation();
			e.preventDefault();

			let btnFlag = this.className.indexOf("submitBtn");
			//如果是确认按钮 同时不是备忘类型日历
			if(btnFlag > -1 && self.date_type !== "Memo"){
				//如果是单日期选择  不带时间
				if(!self.initConfig["dateZoom"] && !("Y-M-D-H-Mi" === self.date_type)){
					document.getElementById("datetimepicker").firstElementChild.value = self.currYear+"年"+self.currMonth+"月"+self.currDate+"日";
					$(".blankPanel").remove();
				}
				//单日期  带时间
				else if(!self.initConfig["dateZoom"] && ("Y-M-D-H-Mi" === self.date_type)){
					document.getElementById("datetimepicker").firstElementChild.value = self.currYear+"年"+self.currMonth+"月"+self.currDate+"日"+
											self.currTime["hour"]+"时"+self.currTime["minute"]+"分"+self.currTime["second"]+"秒";
					$(".blankPanel").remove();
				}
				//如果是日期区间选择
				else{
					//首先判断用户是否点击了第二次
					if(!self.secondClickDate){
						alert("当前为日期区间选择，请选择结束日期");
					}else{
						document.getElementById("datetimepicker").firstElementChild.value =
											self.currYear+"年"+self.currMonth+"月"+self.firstClickDate.innerHTML.match(/^\d+/g)[0]+"日 到 "+
											self.currYear+"年"+self.currMonth+"月"+self.secondClickDate.innerHTML.match(/^\d+/g)[0]+"日";
						$(".blankPanel").remove();
					}
				}

			}
			//确认按钮  同时 是备忘类型
			else if(btnFlag > -1 && self.date_type === "Memo"){
				//备忘窗口不存在则添加
				if($(".memoDiv")[0] === undefined){
					$(this).append(`
						<div class="memoDiv"></div>
						`);
					//es6模板字符串特性
					$(".memoDiv").append(`
						<form method="post">
							<label for="memoTime">时间：<input type="text" name="memoTime" value="${self.currYear+"年"
																																										+self.currMonth+"月"
																																										+self.currDate+"日"
																																										+self.currTime["hour"]+"时"
																																										+self.currTime["minute"]+"分"
																																										+self.currTime["second"]+"秒"}"></label>
							<label for="memoAddress">地点：<input type="text" name="memoAddress" placeholder="必填项" required></label>
							<label for="memoTheme">主题：<input type="text" name="memoTheme" placeholder="必填项" required></label>
							<label for="memoSubmit"><input type="submit" name="memoSubmit" value="提交"></label>
						</form>`
					)
					//表单提交事件
					$("input[type='submit']").on("click",function(e){
						e.stopPropagation();
						e.preventDefault();

						let memoInfo = $(".memoDiv form").serializeArray();
						self.callback(memoInfo);
						$(".blankPanel").remove();
					})
				}
			}
			//如果是取消按钮
			else{
				$(".blankPanel").remove();
			}
		})
		return self;
	},
	//创建时间区域
	createTimeInfo:function(containerObj){
		let self = this;
		//每次调用之前，首先初始化时间
		self.currTime = {
			"hour":"00",
			"minute":"00",
			"second":"00"
		}
		//如果是区间日期选择，则不添加时间选择功能
		if(!self.initConfig["dateZoom"]){
			//创建时间信息容器
			$(containerObj).append(`
				<div class="timeContainer">
					<div class="timeShow">
						<span class="hourShow">${self.currTime["hour"]}</span>:
						<span class="minuteShow">${self.currTime["minute"]}</span>:
						<span class="secondShow">${self.currTime["second"]}</span>
					</div>
				</div>
				`)

			let timeContainer = $(".timeContainer")[0];
			let docFragment = document.createDocumentFragment();
			for(let i=0; i<3; i++){
				//创建滑动选择时间的固定横轴和移动块
				$(docFragment).append(`
					<div class="timeFixedDiv">
						<div class="timeMovedDiv"></div>
					</div>
					`);
			}
			$(timeContainer).append(docFragment);

			//为固定横轴写点击事件
			$(".timeFixedDiv").on("click",function(e){
				e.stopPropagation();
				e.preventDefault();

				let offsetLeft = e.clientX - this.clientLeft + $(".blankPanel")[0].clientLeft;
				let index = [...$(".timeMovedDiv")].indexOf(this.firstElementChild);
				//计算小时值
				if(index === 0){
					let hour = Util.calculateTime(offsetLeft,'hour');
					$(".hourShow").html(hour);
					//更改Calender对象中的时间属性
					self.currTime["hour"] = hour;
				}
				//计算分钟值
				else if(index === 1){
					let minute = Util.calculateTime(offsetLeft,'minute');
					$(".minuteShow").html(minute);
					//更改Calender对象中的时间属性
					self.currTime["minute"] = minute;
				}
				//计算秒钟值
				else if(index === 2){
					let second = Util.calculateTime(offsetLeft,'second');
					$(".secondShow").html(second);
					//更改Calender对象中的时间属性
					self.currTime["second"] = second;
				}
				//更改滑块的位置
				$(this.firstElementChild).css("left",offsetLeft+"px");
			})

			//为滑块绑定滑动事件
			$(".timeMovedDiv").draggable({
				'axis': "x",
				'containment':".timeFixedDiv",
				drag:function(events,ui){
					let currMovedEle = ui.helper[0];//当前拖动元素
					let allMovedELe = $(".timeMovedDiv");//所有可拖动的元素
					let offsetLeft = currMovedEle.offsetLeft;//偏移父元素左端的距离
					let index = [...allMovedELe].indexOf(currMovedEle);
					//根据其父元素是否具有上下兄弟节点来判断其改变的是时分秒
					//计算小时值
					if(index === 0){
						let hour = Util.calculateTime(offsetLeft,'hour');
						$(".hourShow").html(hour);
						//更改Calender对象中的时间属性
						self.currTime["hour"] = hour;
					}
					//计算分钟值
					else if(index === 1){
						let minute = Util.calculateTime(offsetLeft,'minute');
						$(".minuteShow").html(minute);
						//更改Calender对象中的时间属性
						self.currTime["minute"] = minute;
					}
					//计算秒钟值
					else if(index === 2){
						let second = Util.calculateTime(offsetLeft,'second');
						$(".secondShow").html(second);
						//更改Calender对象中的时间属性
						self.currTime["second"] = second;
					}
				}
			})
		}
		return self;
	},
	//创建年选择面板
	createYearPanel:function(containerObj,initYear){
		let self = this;
		self.removeInit();
		//创建年份面板容器
		$(containerObj).append(`
			<div class="yearSelectContainer"></div>
			`);
		let yearSelectContainer = $(".yearSelectContainer")[0];
		let docFragment = document.createDocumentFragment();
		//创建显示
		for(let i=initYear; i<initYear+12; i++){
			$(docFragment).append(`
				<div class="eachYearEle">${i}</div>
				`);
		}
		$(yearSelectContainer).append(docFragment);

		//更改年份展示区域
		$(".yearShow").html(initYear + "--" + (initYear+11));

		//绑定点击事件
		$(".eachYearEle").on("click",function(e){
			e.stopPropagation();
			e.preventDefault();
			//更改Calendar对象属性
			self.currYear = parseInt(this.innerHTML);
			//生成月份
			self.createMonthPanel($(".blankPanel")[0]);
			//获取当前年的农历年份
			let lunarYear = LunarDate.GetLunarDay(self.currYear,self.currMonth,self.currDate).split(" ")[0];
			//更改年份显示
			$(".yearShow").html(self.currYear + "年 "+lunarYear);
		});
		return self;
	},
	//创建月份选择面板
	createMonthPanel:function(containerObj){
		let self = this;
		self.removeInit();

		//创建月份面板容器
		$(containerObj).append(`
			<div class="monthSelectContainer"></div>
			`);
		let monthSelectContainer = $(".monthSelectContainer")[0];
		let docFragment = document.createDocumentFragment();
		//创建显示
		for(let i=0; i<12; i++){
			$(docFragment).append(`
				<div class="eachMonthEle">${i+1}月</div>
				`);
		}
		$(monthSelectContainer).append(docFragment);

		//绑定点击事件
		$(".eachMonthEle").on("click",function(e=window.events){
			e.stopPropagation();
			e.preventDefault();
			//更改Calendar对象属性
			self.currMonth = parseInt(this.innerHTML.match(/^\d+/g)[0]);
			//生成日期信息
			let blankPanel = $(".blankPanel")[0]
			self.createDateInfo(blankPanel).createTimeInfo(blankPanel).createBtnInfo(blankPanel);
			//更改月份显示
			$(".monthShow").html(self.currMonth + "月");
			//释放月份翻页的禁用状态
			$(".switchBtn.not-allow-selected").removeClass("not-allow-selected");
		});
		return self;
	},
	//移除
	removeInit:function(){
		//先移除日期面板
		$(".dayContainer,.dateContainer,.timeContainer,.btnContainer,.yearSelectContainer,.monthSelectContainer").remove()
	}
}

var Util = {
	//计算每个月有几天
	howManyDate:function(year,month){
		if(month == 0){
			year = year - 1;
			month = 12;
		}
		//计算每个月有几天,此处对2000年这种不做判断，觉得我们应该活不到下一次了
		if(!(year%4)){//二月闰
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
		}else{//二月平
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
	calculateTime:function(offsetLeft,type){
		let fixedLength = 382;

		if("hour" === type){
			let result = Math.floor((23 * offsetLeft)/fixedLength) + "";
			if(result.length === 1){
				result = "0"+result;
			}
			return result;
		}
		else if("minute" === type){
			let result = Math.floor((59 * offsetLeft)/fixedLength) + "";
			if(result.length === 1){
				result = "0"+result;
			}
			return result;
		}
		else if("second" === type){
			let result = Math.floor((59 * offsetLeft)/fixedLength) + "";
			if(result.length === 1){
				result = "0"+result;
			}
			return result;
		}
	},
	calSpecialDate:function(YaLdate,YiLdate){
		//先声明一个Generater函数
		/*function* objectEntries(){
			let propkeys = Object.keys(this);
			for(let propkey of propkeys){
				yield [propkey,this[propkey]];
			}
		}*/

		let resObj = {"isSpec":false,"specDate":{}};

		let YaLSpecDate = {"11":"元旦","38":"妇女节","51":"劳动节","61":"儿童节","71":"建党节","81":"建军节","101":"国庆节","1225":"圣诞节"};
		let YiLSpecDate = {"正月初一":"春节","正月十五":"元宵节","五月初五":"端午节","七月十五":"中元节","八月十五":"中秋节","九月初九":"重阳节"};
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
		for(let key_YaL in YaLSpecDate){
			if(YaLdate === key_YaL){
				resObj["isSpec"] = true;
				resObj["specDate"] = YaLSpecDate[key_YaL];
				break;
			}
		}
		for(let key_YiL in YiLSpecDate){
			if(YiLdate === key_YiL){
				resObj["isSpec"] = true;
				resObj["specDate"] = YiLSpecDate[key_YiL];
				break;
			}
		}
		return resObj;
	}
}
