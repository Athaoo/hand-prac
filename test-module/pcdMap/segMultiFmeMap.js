globalThis.__MixPcd = (function () {
	/** 任务是否包含混合连续帧的点云 */
	let isMixTypeTask = false

	/** 是否正在标注混合大点云 */
	let isMix = false

	let mixFme = null

	/** 混合帧/连续帧的数据转换器 */
	let dt

	/**
	 *
	 * @param {MultiFrameLoader} loader
	 */
	function handleLoader(loader) {}

	function isMixMode() {
		return isMix
	}

	function toggleMode(isMixMode = false) {
		let ifTurnMix
		if (isMixMode === undefined) {
			ifTurnMix = !isMix
		} else {
			ifTurnMix = !!isMixMode
		}

		ifTurnMix ? turnMix() : turnSplit(1)
	}

	async function turnMix(ifSave = true) {
		isMix = true
		ANNO.loader.setBufferSize(1)

		await labelTool.changeFrame(mixFme, ifSave, true)
	}

	async function turnSplit(fme, ifSave = true) {
		isMix = false
		// ANNO.loader.setBufferSize(17)
		const bufferSize = 1 + Math.floor(Math.random() * 4)
		ANNO.loader.setBufferSize(bufferSize)
		ANNO.loader.setOctreesSize(bufferSize)

		// if (fme === mixFme || !_.isNumber(fme)) {
		// 	fme = 1
		// }
		await labelTool.changeFrame(fme, ifSave, true)
	}

	function setMixTask(is = true) {
		isMixTypeTask = is
	}

	function isMixTask() {
		return isMixTypeTask
	}

	function getMixFme() {
		return mixFme
	}

	function setMixFme(fme) {
		mixFme = fme ?? null
	}

	/**
	 *
	 * @param {taskDataResponse} data
	 */
	function analyzeTaskData(data) {
		let fme = 0,
			isMixTask = false
		if (false) {
			setMixFme(fme)
		} else {
			isMixTask = true
		}
		// setMixTask(isMixTask)

		setMixTask(true)
		setMixFme(0)
	}

	function handleIfInitMixFme() {
		if (annoState.frameNum <= 1) return true

		return new Promise((resolve, reject) => {
			$.confirm({
				title: '多帧合成',
				content: `
                当前任务为多帧合成任务, 是否进入混合帧?
              `,
				boxWidth: '500px',
				useBootstrap: false,
				buttons: {
					formSubmit: {
						text: '是',
						btnClass: 'el-style__button',
						action: function () {
							resolve(true)
						},
					},
					cancel: {
						text: '否',
						btnClass: 'el-style__button',
						action: function () {
							resolve(false)
						},
					},
				},
			})
		})
	}

	function handleIfChangeMode() {
		return new Promise((resolve, reject) => {
			$.confirm({
				title: '多帧合成',
				content: `
                ?
              `,
				boxWidth: '500px',
				useBootstrap: false,
				buttons: {
					formSubmit: {
						text: '是',
						btnClass: 'el-style__button',
						action: function () {
							resolve(true)
						},
					},
					cancel: {
						text: '否',
						btnClass: 'el-style__button',
						action: function () {
							resolve(false)
						},
					},
				},
			})
		})
	}

	function handleExCfg() {
		pointRanges
	}

	/** @typedef {[start:number, end:number][]} PointRanges */

	/**
	 * @param {PointRanges} pointRanges
	 */
	function flushDataTransformer(pointRanges) {
		dt = createDataTransformer(pointRanges)
	}

	function disposeDataTransformer() {
		dt = null
	}

	/**
	 * @param {PointRanges} pointRanges
	 */
	function createDataTransformer(pointRanges) {
		const mixMap = createMap(pointRanges)

		function splitmixFmeData() {
			return splitMixSegData()
		}

		function splitMixSegData() {
			/**@type {{ className, id, pointsIndexs }[]} */
			const mixFmeData = [
				{ className: 'ClassA', id: 1, pointsIndexs: [0, 100, 200, 300] },
				{ className: 'ClassB', id: 2, pointsIndexs: [50, 150, 250, 350] },
				{ className: 'ClassC', id: 3, pointsIndexs: [10, 110, 210, 310] },
				{ className: 'ClassD', id: 4, pointsIndexs: [25, 125, 225, 325] },
				{ className: 'ClassE', id: 5, pointsIndexs: [75, 175, 275, 375] },
				{ className: 'ClassF', id: 6, pointsIndexs: [5, 105, 205, 305] },
				{ className: 'ClassG', id: 7, pointsIndexs: [35, 135, 235, 335] },
				{ className: 'ClassH', id: 8, pointsIndexs: [15, 115, 215, 315] },
				{ className: 'ClassI', id: 9, pointsIndexs: [45, 145, 245, 345] },
				{ className: 'ClassJ', id: 10, pointsIndexs: [55, 155, 255, 355] },
			]
			const res = new Map()
			if (!mixFmeData?.length) {
				return []
			}

			let temp = new Map()
			for (const { className, id, pointsIndexs } of mixFmeData) {
				for (const mixIdx of pointsIndexs) {
					const data = mixIdxToSplit(mixIdx)
					if (!data) continue

					const { fme, splitIdx } = data
					if (!temp.get(fme)) {
						const item = { className, id, pointsIndexs: [splitIdx] }
						temp.set(fme, item)
					} else {
						temp.get(fme).pointIndexs.push(splitIdx)
					}
				}
				temp.forEach((item, fme) => {
					if (!res.get(fme)) {
						res.set(fme, [item])
					} else {
						res.get(fme).push(item)
					}
				})
				temp.clear()
			}

			return res
		}

		// function splitMixTargetDetectionData() {
		//   const mixFmeData = annoState.getFrameLabelData(mixFme)
		// }

		function splitIdxToMix(fme, pointIdx) {
			if (fme >= pointRanges.length) {
				return -1
			}
			const [start, _] = pointRanges[fme]
			if (pointIdx >= _ - start + 1) {
				return -1
			}
			return start + pointIdx
		}

		function mixIdxToSplit(mixPointIdx) {
			const mixPoint = mixMap.get(mixPointIdx)
			if (!mixPoint) return null

			const { fme, splitIdx } = mixPoint ?? { fme: -1, splitIdx: -1 }
			return { fme, splitIdx }
		}

		/**
		 * @param {PointRanges} pointRanges
		 */
		function createMap(pointRanges) {
			const mixMap = new Map()
			for (let fme = 0; fme < pointRanges.length; fme++) {
				const [start, end] = pointRanges[fme]
				for (let i = start; i <= end; i++) {
					mixMap.set(i, { fme, splitIdx: i - start })
				}
			}
			return mixMap
		}

		return {
			splitmixFmeData,
			splitIdxToMix,
			mixIdxToSplit,
		}
	}

	function getDt() {
		return dt
	}

	return {
		analyzeTaskData,
		handleIfInitMixFme,
		isMixMode,
		toggleMode,
		isMixTask,
		setMixTask,
		setMixFme,
		getMixFme,
		turnSplit,
		turnMix,
		flushDataTransformer,
		disposeDataTransformer,
		getDt,
	}
})()

export default __MixPcd
