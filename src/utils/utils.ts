import { parse } from 'querystring';
import crypto from 'crypto';
import { Moment } from 'moment';
import saveAs from 'file-saver';
import Item from 'antd/lib/list/Item';
/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

Date.prototype.Format = function (fmt: string) {
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"H+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		S: this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(
			RegExp.$1,
			(this.getFullYear() + "").substr(4 - RegExp.$1.length)
		);
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(
				RegExp.$1,
				RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
			);
	return fmt;
};

export const CommonUtils = {
	isEmptyOrNull(v: any): boolean { // 判断字符串是否为空
		return typeof (v) === 'undefined' || v === '' || v === null ? true : false;
	},
	isObject(v: any): boolean { // 判断是否为对象
		if (Object.prototype.toString.call(v) == '[object Array]') {
			return false;
		}
		return typeof (v) === 'object' || v != null ? true : false;
	},
	isArray(v: any): boolean { // 判断是否为数组
		return Object.prototype.toString.call(v) === '[object Array]';
	},
	isNodeList(v: any): boolean { // 判断是否为节点集
		return Object.prototype.toString.call(v) === '[object NodeList]';
	},
	isInputElement(v: any): boolean { // 判断是否为input元素
		return Object.prototype.toString.call(v) === '[object HTMLInputElement]';
	},
	isFunction(v: any): boolean { // 判断是否为函数
		return typeof (v) === 'function';
	},
	isNumber(v: any): boolean { // 判断是否为数字
		return typeof (v) === 'number';
	},
	isString(v: any): boolean { // 判断是否为字符串
		return typeof (v) === 'string';
	},
	isExternal(path: string): boolean {
		return /^(https?:|mailto:|tel:)/.test(path)
	},
	/**
	 * @param {*} obj1 对象
	 * @param {*} obj2 对象
	 * @description 判断两个对象是否相等，这两个对象的值只能是数字或字符串
	 */
	objEqual(obj1: Object, obj2: Object): boolean {
		const keysArr1 = Object.keys(obj1)
		const keysArr2 = Object.keys(obj2)
		if (keysArr1.length !== keysArr2.length) return false
		else if (keysArr1.length === 0 && keysArr2.length === 0) return true
		else return !keysArr1.some(key => obj1[key] != obj2[key])
	},
	hasChild(item: { children?: any[] }): boolean {
		return item.children !== undefined && item.children.length !== 0
	},
	/**
	 * @param {Array} target 目标数组
	 * @param {Array} arr 需要查询的数组
	 * @description 判断要查询的数组是否至少有一个元素包含在目标数组中
	 */
	hasOneOf(targetarr: any[], arr: any[]): boolean {
		return targetarr.some(_ => arr.indexOf(_) > -1)
	},
	/**
	 * @param {String} url
	 * @description 从URL中解析参数
	 */
	getParams(url: string): Object {
		const keyValueArr = url.split('?')[1].split('&');
		let paramObj = {}
		keyValueArr.forEach(item => {
			const keyValue = item.split('=')
			paramObj[keyValue[0]] = keyValue[1]
		})
		return paramObj
	},
	/**

	 * @param {Number} times 回调函数需要执行的次数
	 * @param {Function} callback 回调函数
	 */
	doCustomTimes(times: number, callback: Function): void {
		let i = -1
		while (++i < times) {
			callback(i)
		}
	},
	/**
	 * @description 抽取并格式化时间
	 * @param {Array} dateArr 时间数组[start,end]
	 * @param {Number} index 格式化位置下标
	 */
	formatDateArr(dateArr: any[], index: number): string {
		if (Array.isArray(dateArr) && dateArr.length > 0) {
			return index == 0 ? new Date(dateArr[index]).Format('yyyy/MM/dd') + ' 00:00:00' : new Date(dateArr[index]).Format('yyyy/MM/dd') + ' 23:59:59';
		} else {
			return '';
		}
	},

	//todo:: 以下代码没有转ts

	/**
	 * @description 格式化参数
	 * @param {Object} formData 查询参数
	 * @param {String} stateDate 开始时间参数字段
	 * @param {String} endDate 结束时间参数字段
	 */
	formatParams(formData: { dateTime?: Moment[] }, stateDate = 'start_date', endDate = 'end_date') {
		let params = JSON.parse(JSON.stringify(formData));
		params[stateDate] = CommonUtils.formatDateArr(params.dateTime, 0);
		params[endDate] = CommonUtils.formatDateArr(params.dateTime, 1);

		Object.keys(params).forEach((item) => {
			if (CommonUtils.isEmptyOrNull(params[item]) && params[item] !== 0 && params[item] !== "0") {
				delete params[item]
			}
		});
		return params;
	},

	// 深拷贝
    deepCopy(obj: any) {
        function deepCopy(obj: any){
            let newObj = Array.isArray(obj) ? []: {}   //判断是深拷贝对象还是数组
            for(let i in obj){
                if(typeof obj[i] === 'object') {
                    newObj[i] = deepCopy(obj[i])    //  如果要拷贝的对象的属性依然是个复合类型，递归
                } else {
                    newObj[i] = obj[i]
                }
            }
            return newObj
        }

        return deepCopy(obj);
	},

	/**
	 * @description 格式化参数大写
	 * @param {Object} formData 查询参数
	 */
	formatParamsUpper(formData) {
		let params = JSON.parse(JSON.stringify(formData));
		params.startDate = CommonUtils.formatDateArr(params.dateTime, 0);
		params.endDate = CommonUtils.formatDateArr(params.dateTime, 1);
		Object.keys(params).forEach((item) => {
			if (CommonUtils.isEmptyOrNull(params[item]) && params[item] !== 0) {
				delete params[item]
			}
		});
		return params;
	},
	// 判断对象属性值是否皆为空
	judgeObjNull(obj) {
		let count = 0;
		let objLength = Object.keys(obj);
		for (let key in obj) {
			if (!obj[key] && (obj[key] !== 0 && obj[key] !== "0")) {
				count++
			}
		}
		return count >= objLength.length
	},

	// 判断对象属性值是否有为空
	judgeObjSomeNull(obj, arr = []) {
		for (let key in obj) {
			if (arr.includes(key)) {
				continue;
			}
			if (CommonUtils.isEmptyOrNull(obj[key])) {
				return key
			}
		}
		return false;
	},

	// 判断数组对象属性是否皆为空
	judgeArrNull(arr) {
		for (let i = 0; i < arr.length; i++) {
			console.log(arr[i])
			if (!arr[i]) {
				return true;
			} else {
				let flag = this.judgeObjSomeNull(arr[i]);
				if (flag) return true;
			}
		}
		return false;
	},
	/**
	 * @description 格式化单个日期参数
	 * @param {Date,String}
	 */
	formatDate(date, format = 'yyyy/MM/dd HH:mm:ss') {
		if (!date) return null;
		if (Array.isArray(date)) {
			return [new Date(date[0]).Format(format), new Date(date[1]).Format(format)]
		}
		return new Date(date).Format(format);
	},

	/**
	 * @description 金额四舍五入，千位分隔
	 * @param {*} current
	 * @returns
	 */
	numberFormatter(current) {
		current *= 1;
		if (CommonUtils.isNumber(current)) {
			let num = Math.round(current);
			return Math.abs(num) < 1000 ? num : num.toString().replace(/(\d)(?=(?:\d{3}[+]?)+$)/g, '$1,');
		} else {
			return current;
		}
	},
	/**
	 * @description 最多保留两位
	 * @param {String} val
	 * @returns
	 */
	keepTwo(val) {
		if (!CommonUtils.isString(val)) {
			return val
		}
		let pointIndex = val.indexOf('.');
		let isFloat = pointIndex != -1;
		if (isFloat && val.length > pointIndex + 2 + 1) {
			val = val.substring(0, pointIndex + 2 + 1);
		}
		return val;
	},

	//将base64转换为blob
	dataURLtoBlob(dataurl) {
		let arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], {
			type: mime
		});
	},
	//将blob转换为file
	blobToFile(base64Data, fileName) {
		let theBlob = this.dataURLtoBlob(base64Data);
		theBlob.lastModifiedDate = new Date();
		theBlob.name = fileName;
		return theBlob;
	},

	// 函数节流
	throttle(method, delay, duration) {
		let timer = null;
		let begin = new Date();
		return function () {
			let context = this,
				args = arguments;
			let current = new Date();
			clearTimeout(timer);
			if (current - begin >= duration) {
				method.apply(context, args);
				begin = current;
			} else {
				timer = setTimeout(() => {
					method.apply(context, args);
				}, delay);
			}
		}
	},

	// 数组去重
	distinct(arr: Array<any>) {
		let result = []
		let obj = {}
		for (let i of arr) {
			if (!obj[i]) {
				result.push(i)
				obj[i] = 1
			}
		}
		return result;
	},

	insertValueToArr(list: any[], flag: any, key: string, children: string, obj: any): any[] {
		return list.map(item => {
			if (item[key] === flag) {
				return {
					...item,
					[children]: obj
				}
			} else if (item[children] && item[children].length) {
				return {
					...item,
					[children]: CommonUtils.insertValueToArr(item[children], flag, key, children, obj)
				}
			} else {
				return item
			}
		})
	},

	/**
	 * 深层对象获取
	 * @param {*} obj 传入需要获取的对象数组
	 * @param {*} paths 路径，['a', 'b', 'c', 'd'] || 'a.b.c.d' || '0.a.1.b'
	 * @returns 获取后的对象属性，如果没有返回undefined
	 */
	getDeepObj(obj: object, paths: string) {

		if (typeof paths === 'string') {
			paths = paths.split('.');
		}

		function myReducer(arr, reducer, initVal) {
			for (let i = 0; i < arr.length; i++) {
				initVal = reducer(initVal, arr[i], i, arr);
			}
			return initVal
		}

		return myReducer(paths, (value, key) => {
			if (!value && value !== 0 && value !== '0') {
				return undefined;
			}
			if (/^[0-9]+$/.test(key)) {
				key = Number(key)
			}
			return value[key];
		}, obj)
	},

	//获取count天前后的日期
	getTime(count) {
		let dd = new Date();
		dd.setDate(dd.getDate() + count);
		let year = dd.getFullYear();
		let mon = dd.getMonth() + 1;
		let day = dd.getDate();
		return year + "/" + mon + "/" + day;
	},

	/**
	 * @description 表单校验必填
	*/
	validateFieldsRequired(value: any, errMsg: string) {
		let errorArr: any[] = [];
		if(CommonUtils.isEmptyOrNull(value)) {
			errorArr = [{message: errMsg}]
		}
		return errorArr;
	}
}

/**
 * @description md5加密
 * @param {String} str
 */
export function getmd5(str: string): string {
	let encryption;
	let md5 = crypto.createHash("md5");
	md5.update(str);
	encryption = md5.digest('hex');
	return encryption;
}

/**
 * @description cookie类
 */
class CookieStorage {
	setCookie(name, value, time) {
		if (CommonUtils.isEmptyOrNull(name) || CommonUtils.isEmptyOrNull(value)) {
			return;
		}
		let date = new Date();
		let times = 0;
		if (time.charAt(0).toLowerCase() === 'd') { // 以天为单位
			times = parseInt(time.substr(1));
			date.setTime(date.getTime() + times * 24 * 60 * 60 * 1000);
		} else if (time.charAt(0).toLowerCase() === 'h') { // 以小时为单位
			times = parseInt(time.substr(1));
			date.setTime(date.getTime() + times * 60 * 60 * 1000);
		}
		document.cookie = name + '=' + escape(value) + ' ;expires=' + date.toGMTString();
	}
	getCookie(name) {
		if (CommonUtils.isEmptyOrNull(name)) {
			return;
		}
		let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
		let arr = document.cookie.match(reg);
		if (!CommonUtils.isArray(arr)) {
			return null;
		}
		return unescape(arr[2]);
	}
	clearCookie(name) {
		let cookie = this.getCookie(name);
		if (CommonUtils.isEmptyOrNull(name) || CommonUtils.isEmptyOrNull(cookie)) {
			return;
		}
		let date = new Date();
		date.setTime(date.getTime() - 1);
		document.cookie = name + '=' + cookie + ' ;expires=' + date.toGMTString();
	}
	clearAllCookie(withoutKey) {
		if (!CommonUtils.isEmptyOrNull(name) && !Array.isArray(withoutKey)) return;
		let withoutArr = withoutKey ? withoutKey : [];
		let keys = document.cookie.match(/[^ =;]+(?=\=)/g);
		keys && keys.forEach(item => {
			if (!withoutArr.includes(item)) {
				document.cookie = item + '=0;expires=' + new Date(0).toUTCString();
			}
		})
	}
}
export const Cookie = new CookieStorage();

export function download(data: any, fileName: string, contentType: string) {
	const file = new Blob([data], {
		type: contentType || 'application/octet-stream'
	});
	saveAs(file, fileName);
}
