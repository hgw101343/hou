export interface optionType {
	name: string;
	desc: string;
	type: number;
	detailDesc: Array<string>;
}

export interface dataType {
	title: string;
	desc: string;
	options: Array<optionType>;
}

export const data: Array<dataType> = [
	{
		title: '个人身份开店',
		desc: '适合个人/个体工商店户入驻提供身份证等即可开店',
		options: [
			{
				name: '个人店',
				type: 11,
				desc: '个人身份开店（无营业执照）',
				detailDesc: ['以个人身份申请入驻，无营业执照，提供个人身份资料信息即可开店。'],
			},
			{
				name: '个人工商店',
				type: 12,
				desc: '个人工商户开店（有营业执照）',
				detailDesc: ['以个人身份申请入驻，提供营业执照、个人身份资料信息即可开店。'],
			},
		],
	},
	{
		title: '企业身份开店',
		desc: '适合公司/企业开店提供营业执照等资料即可开店',
		options: [
			{
				name: '旗舰店',
				type: 21,
				desc: '经营自有品牌或1个1级授权品牌旗舰店',
				detailDesc: [
					'商家以自由品牌（商标为R或TM状态）入驻开设的店铺',
					'旗舰店可以有以下几种类型：',
					'1. 经营一个自有品牌商品的品牌旗舰店；',
					'2. 开店主体必须是品牌（商标）权利人或持有权利人出具的开设趣专享品牌旗舰店排他性授权文件的企业。',
				],
			},
			{
				name: '专卖店',
				type: 22,
				desc: '经营自有品牌或1个授权销售专卖店（≤2级）',
				detailDesc: [
					'商家持品牌授权文件在趣专享开设的店铺。',
					'专卖店需符合以下条件：',
					'1. 经营一个授权销售品牌商品的专卖店；',
					'2. 品牌（商标）权利人出具的授权文件不得有地域限制，且授权有效期不得早于2016年12月31日。',
				],
			},
			{
				name: '专营店',
				type: 23,
				desc: '经营1个或多个自有/他人品牌的专营店',
				detailDesc: [
					'经营同一主营大类下多个品牌商品的店铺。',
					'专营店有以下几种类型：',
					'1. 经营多个自有品牌商品的专营店；',
					'2. 经营多个授权品牌商品的专营店；',
					'3. 既经营自有品牌商品又经营授权品牌商品的专营店。',
				],
			},
			{
				name: '普通店',
				type: 24,
				desc: '普通企业店铺',
				detailDesc: ['以企业身份申请入驻，提供营业执照等资料即可开店。'],
			},
		],
	},
];
