(function($){
	$.datetimepicker = function(selector){
		$(selector).on("click",function(){
			var date_type = this.getAttribute("date-type");

			//获取当前日期
			var now = new Date();

			if("Y-M-D" === date_type){
				new Calender(now,date_type).createBlankPanel(this)
								 .createHeadInfo($(".blankPanel")[0])
								 .createDateInfo($(".blankPanel")[0]);
			}
		})
	}
})($)

var Calender = function(datetime,date_type){
	this.currYear = datetime.getFullYear();
	this.currMonth = datetime.getMonth()+1;
	this.currDate = datetime.getDate();
	this.currDay = datetime.getDay();
	this.date_type = date_type;
};

//创建一个空白的底层容器
Calender.prototype.createBlankPanel = function(obj) {
	//已经有了的话，先移除
	$(".blankPanel").remove();

	var panelElement = document.createElement("div");
	panelElement.className = "blankPanel";
	panelElement.style.top = $(obj).css("height"); 
	obj.appendChild(panelElement);

	return this;
};
//创建顶部日期显示区域
Calender.prototype.createHeadInfo = function(containerObj) {
	var self = this;
	//创建头部底层容器
	var headElement = document.createElement("div");
	headElement.className = "headYearMonth";
	containerObj.appendChild(headElement);
	//创建年份左翻页
	var yearLeft = document.createElement("div");
	yearLeft.className = "switchBtn";
	yearLeft.innerHTML = "<<";
	headElement.appendChild(yearLeft);
	//创建月份左翻页
	var monthLeft = document.createElement("div");
	monthLeft.className = "switchBtn";
	monthLeft.innerHTML = "<";
	headElement.appendChild(monthLeft);
	//创建年份显示区域
	var yearShow = document.createElement("div");
	yearShow.className = "yearShow show";
	yearShow.innerHTML = this.currYear + "年";
	headElement.appendChild(yearShow);
	//创建月份显示区域
	var monthShow = document.createElement("div");
	monthShow.className = "monthShow show";
	monthShow.innerHTML = this.currMonth + "月";
	headElement.appendChild(monthShow);
	//创建月份右翻页
	var monthRight = document.createElement("div");
	monthRight.className = "switchBtn";
	monthRight.innerHTML = ">";
	headElement.appendChild(monthRight);
	//创建年份右翻页
	var yearRight = document.createElement("div");
	yearRight.className = "switchBtn";
	yearRight.innerHTML = ">>";
	headElement.appendChild(yearRight);

	//为年月左右翻页绑定事件
	$(".switchBtn").on("click",function(e){

		var e = e || window.events;
		e.stopPropagation();
		e.preventDefault();

		var currAction = this.innerHTML;
		//<<
		if("&lt;&lt;" === currAction){
			//获取当前显示的年份
			var currShowYear = $(".yearShow").html();
			//判断改变年份还是年区间
			var index = currShowYear.indexOf("-");
			if(index > -1){
				//待完成
				//年区间翻页
			}else{
				var previousYear = parseInt(currShowYear) - 1;
				$(".yearShow").html(previousYear + "年");
			}
			//刷新日期面板
			//更新calendar对象信息
			self.currYear = previousYear;
			//
			self.createDateInfo($(".blankPanel")[0]);
		}
		//<
		else if("&lt;" === currAction){
			//获取当前显示的月份
			var currShowMonth = $(".monthShow").html();
			//判断改变月份
			var previousMonth = parseInt(currShowMonth) - 1;
			//如果preiviousMonth为0的话，上一年的最后一个月
			if(0 === previousMonth){
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
		//>
		else if("&gt;" === currAction){
			//获取当前显示的月份
			var currShowMonth = $(".monthShow").html();
			//判断改变月份
			var nextMonth = parseInt(currShowMonth) + 1;

			//如果preiviousMonth为13的话，下一年的第一个月
			if(13 === nextMonth){
				//获取当前显示的年份
				var currShowYear = $(".yearShow").html();
				//改为下一年
				var nextYear = parseInt(currShowYear) + 1;
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
		//>>
		else {
			//获取当前显示的年份
			var currShowYear = $(".yearShow").html();
			//判断改变年份还是年区间
			var index = currShowYear.indexOf("-");
			if(index > -1){
				//待完成
				//年区间翻页
			}else{
				var nextYear = parseInt(currShowYear) + 1;
				$(".yearShow").html(nextYear + "年");
			}

			//刷新日期面板
			self.currYear = nextYear;
			//
			self.createDateInfo($(".blankPanel")[0]);
		}
	})

	return self;
};
//创建星期几显示区域和日期显示区域
Calender.prototype.createDateInfo = function(containerObj) {

	var self = this;

	$(".dayContainer,.dateContainer").remove();
	//创建星期几显示区域
	var dayArr = ['日','一','二','三','四','五','六'];
	//创建星期几容器
	var dayContainer = document.createElement("div");
	dayContainer.className = "dayContainer";
	containerObj.appendChild(dayContainer);
	//创建星期几信息
	for(var index=0, len = dayArr.length; index < len; index++){
		var dayInfo = document.createElement("div");
		dayInfo.className = "dayInfo";
		dayInfo.innerHTML = dayArr[index];
		dayContainer.appendChild(dayInfo);
	}
	//创建日期容器
	var dateContainer = document.createElement("div");
	dateContainer.className = "dateContainer";
	containerObj.appendChild(dateContainer);
	//创建日期信息
	//首先判断当前月份有几天，函数在util中
	var sumCurrDate = Util.howManyDate(this.currYear,this.currMonth);
	//判断上个月有几天
	var sumPrevDate = Util.howManyDate(this.currYear,this.currMonth-1);
	//计算本月的第一天为星期几
	var firstDay = new Date(this.currYear+"/"+this.currMonth+"/"+1).getDay();
	//添加本页中可显示的上月日期
	for(var start = (sumPrevDate - firstDay+1); start <= sumPrevDate;start++){
		var dateInfo = document.createElement("div");
		dateInfo.className = "prevMonthDate dateInfo";
		dateInfo.innerHTML = start;
		dateContainer.appendChild(dateInfo);
	}
	//添加本页中可显示的本月日期
	for(var start=1; start<=sumCurrDate;start++){
		var dateInfo = document.createElement("div");
		if(this.currDate == start){
			dateInfo.className = "currMonthDate dateInfo currDate";
		}else{
			dateInfo.className = "currMonthDate dateInfo";
		}
		dateInfo.innerHTML = start;
		dateContainer.appendChild(dateInfo);
	}
	//添加本页中可显示的下个月日期
	//首先获取本月最后一天为星期几
	var lastDay = new Date(this.currYear+"/"+this.currMonth+"/"+sumCurrDate).getDay();
	if(lastDay !== 6){
		for(var start=1; start <= (6 - lastDay); start++){
			var dateInfo = document.createElement("div");
			dateInfo.className = "nextMonthDate dateInfo";
			dateInfo.innerHTML = start;
			dateContainer.appendChild(dateInfo);
		}
	}

	//为日期添加点击事件
	$(".dateInfo").on("click",function(e){
		var e = e || window.events;
		e.stopPropagation();
		e.preventDefault();

		//点击到上个月的日期
		if(this.className.indexOf("prevMonthDate") > -1){
			//获取当前显示的月份
			var currShowMonth = $(".monthShow").html();
			//判断改变月份
			var previousMonth = parseInt(currShowMonth) - 1;
			//如果preiviousMonth为0的话，上一年的最后一个月
			if(0 === previousMonth){
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
		else if(this.className.indexOf("nextMonthDate") > -1){
			//获取当前显示的月份
			var currShowMonth = $(".monthShow").html();
			//判断改变月份
			var nextMonth = parseInt(currShowMonth) + 1;

			//如果preiviousMonth为13的话，下一年的第一个月
			if(13 === nextMonth){
				//获取当前显示的年份
				var currShowYear = $(".yearShow").html();
				//改为下一年
				var nextYear = parseInt(currShowYear) + 1;
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
		else{
			if("Y-M-D" === self.date_type){
				var currDate = this.innerHTML;
				var currMonth = $(".monthShow").html();
				var currYear = $(".yearShow").html();

				document.getElementById("datetimepicker").innerHTML = currYear+currMonth+currDate+"日";

				$(".blankPanel").remove();
			}
		}
	})

};

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
	}
}


























