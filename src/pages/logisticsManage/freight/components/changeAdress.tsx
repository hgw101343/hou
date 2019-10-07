const areaOption = {
	dongBei: '东北',
	huaBei: '华北',
	huaDong: '华东',
	huaNan: '华南',
	huaZhong: '华中',
	xiBei: '西北',
	xiNan: '西南',
};
let logisticsData: Array<any> = [];
let cityObj: any = {};
// 转换后的地址
export const getLogistics = (AllAddress: any) => {
	// 物流数据转化
	let data = AllAddress;
	let defaultExpandedKeys: Array<any> = [];
	Object.keys(data).forEach(area => {
		let areaObj = {
			id: area,
			label: areaOption[area],
			children: [],
			level: 1,
		};
		defaultExpandedKeys.push(area);
		Object.keys(data[area]).forEach(province => {
			let provinceObj = {
				id: province,
				label: data[area][province][0].province,
				children: [],
				level: 2,
			};
			data[area][province].forEach((city1: any) => {
				let cityObj = {
					id: city1.id,
					label: city1.city,
					provinceId: province,
					level: 3,
				};
				provinceObj.children.push(cityObj);
			});
			areaObj.children.push(provinceObj);
		});
		logisticsData.push(areaObj);
	});
};
// 转化地址
export const formatArea = (deliveryAreaMap: any, AllAddress: any) => {
	getLogistics(AllAddress);
	console.log('试试数据', deliveryAreaMap);
	console.log('看看数据', logisticsData);
	let str = '';
	Object.keys(deliveryAreaMap).forEach(item => {
		for (let i = 0; i < logisticsData.length; i++) {
			let provinceObj = logisticsData[i].children.find(province => {
				return province.id == item;
			});
			if (provinceObj) {
				let cityArr = provinceObj.children;
				str += `${provinceObj.label}：`;
				deliveryAreaMap[item].forEach(cityId => {
					cityObj = cityArr.find(city => {
						return city.id == cityId;
					});
					if (cityObj) {
						str += `${cityObj.label}、`;
					}
				});
				str = str.slice(0, -1) + ';';
				break;
			}
		}
	});
	logisticsData = [];
	return str;
};
