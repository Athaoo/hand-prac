export const provincesMock = [
	{
		label: '广东省',
		value: '广东省',
		children: [
			{
				label: '广州市',
				value: '广州市',
				children: [
					{ label: '天河区', value: '天河区' },
					{ label: '越秀区', value: '越秀区' },
					// 其他区县
				],
			},
			{
				label: '深圳市',
				value: '深圳市',
				children: [
					{ label: '福田区', value: '福田区' },
					{ label: '南山区', value: '南山区' },
					// 其他区县
				],
			},
			// 其他城市
		],
	},
	{
		label: '浙江省',
		value: '浙江省',
		children: [
			{
				label: '杭州市',
				value: '杭州市',
				children: [
					{ label: '西湖区', value: '西湖区' },
					{ label: '上城区', value: '上城区' },
					// 其他区县
				],
			},
			{
				label: '宁波市',
				value: '宁波市',
				children: [
					{ label: '海曙区', value: '海曙区' },
					{ label: '江东区', value: '江东区' },
					// 其他区县
				],
			},
			// 其他城市
		],
	},
	{
		label: '北京市',
		value: '北京市',
		children: [
			{
				label: '北京市',
				value: '北京市',
				children: [
					{ label: '东城区', value: '东城区' },
					{ label: '西城区', value: '西城区' },
					// 其他区县
				],
			},
		],
	},
	{
		label: '上海市',
		value: '上海市',
		children: [
			{
				label: '上海市',
				value: '上海市',
				children: [
					{ label: '黄浦区', value: '黄浦区' },
					{ label: '徐汇区', value: '徐汇区' },
					// 其他区县
				],
			},
		],
	},
]

export const foodMockData = [
	{
		label: '亚洲美食',
		value: '亚洲美食',
		children: [
			{
				label: '中国菜系',
				value: '中国菜系',
				children: [
					{
						label: '川菜',
						value: '川菜',
						children: [
							{ label: '麻辣火锅', value: '麻辣火锅' },
							{ label: '宫保鸡丁', value: '宫保鸡丁' },
							{ label: '水煮鱼', value: '水煮鱼' },
							{ label: '回锅肉', value: '回锅肉' },
						],
					},
					{
						label: '粤菜',
						value: '粤菜',
						children: [
							{ label: '广东烧鹅', value: '广东烧鹅' },
							{ label: '腊肠炒饭', value: '腊肠炒饭' },
							{ label: '白切鸡', value: '白切鸡' },
							{ label: '糖醋排骨', value: '糖醋排骨' },
						],
					},
					{
						label: '湘菜',
						value: '湘菜',
						children: [
							{ label: '麻辣香锅', value: '麻辣香锅' },
							{ label: '剁椒鱼头', value: '剁椒鱼头' },
							{ label: '毛氏红烧肉', value: '毛氏红烧肉' },
							{ label: '农家小炒肉', value: '农家小炒肉' },
						],
					},
					// 其他川菜
				],
			},
			{
				label: '日本菜系',
				value: '日本菜系',
				children: [
					{
						label: '寿司',
						value: '寿司',
						children: [
							{ label: '三文鱼寿司', value: '三文鱼寿司' },
							{ label: '吞拿鱼寿司', value: '吞拿鱼寿司' },
							{ label: '虾夹寿司', value: '虾夹寿司' },
							{ label: '章鱼寿司', value: '章鱼寿司' },
						],
					},
					{
						label: '拉面',
						value: '拉面',
						children: [
							{ label: '鸡肉拉面', value: '鸡肉拉面' },
							{ label: '牛肉拉面', value: '牛肉拉面' },
							{ label: '味增汤面', value: '味增汤面' },
							{ label: '乌冬面', value: '乌冬面' },
						],
					},
					{
						label: '烤物',
						value: '烤物',
						children: [
							{ label: '烤鳗鱼', value: '烤鳗鱼' },
							{ label: '烤鸡串', value: '烤鸡串' },
							{ label: '烤牛舌', value: '烤牛舌' },
							{ label: '烤秋刀鱼', value: '烤秋刀鱼' },
						],
					},
					// 日本其他菜系
				],
			},
			// 亚洲其他国家菜系
		],
	},
	{
		label: '欧洲美食',
		value: '欧洲美食',
		children: [
			{
				label: '法国菜系',
				value: '法国菜系',
				children: [
					{
						label: '法式大餐',
						value: '法式大餐',
						children: [
							{ label: '法式浓汤', value: '法式浓汤' },
							{ label: '鹅肝酱', value: '鹅肝酱' },
							{ label: '焗藤蔓螺', value: '焗藤蔓螺' },
							{ label: '蓝带牛排', value: '蓝带牛排' },
						],
					},
					{
						label: '意式美食',
						value: '意式美食',
						children: [
							{ label: '意大利面', value: '意大利面' },
							{ label: '披萨', value: '披萨' },
							{ label: '烤面包', value: '烤面包' },
							{ label: '托斯卡纳鸡', value: '托斯卡纳鸡' },
						],
					},
					// 法国其他菜系
				],
			},
			{
				label: '西班牙菜系',
				value: '西班牙菜系',
				children: [
					{
						label: '西班牙海鲜',
						value: '西班牙海鲜',
						children: [
							{ label: '西班牙海鲜饭', value: '西班牙海鲜饭' },
							{ label: '炸鱼片', value: '炸鱼片' },
							{ label: '鱼子酱土豆泥', value: '鱼子酱土豆泥' },
							{ label: '蒜蓉虾', value: '蒜蓉虾' },
						],
					},
					{
						label: '塞尔维亚美食',
						value: '塞尔维亚美食',
						children: [
							{ label: '烤肉', value: '烤肉' },
							{ label: '塞尔维亚汤', value: '塞尔维亚汤' },
							{ label: '切糕', value: '切糕' },
							{ label: '奶酪面包', value: '奶酪面包' },
						],
					},
					// 西班牙其他菜系
				],
			},
			// 欧洲其他国家菜系
		],
	},
	// 全球其他大洲美食
]
