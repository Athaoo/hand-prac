/**
 * @typedef {Object} VTreeNode
 * @property {string} key
 * @property {string} title
 * @property {VTreeNode[]|null} children
 */

/**
 * @typedef {Object} FlatVTreeNode
 * @property {string} key
 * @property {string} title
 * @property {number} level
 * @property {VTreeNode[]|null} children
 */

/**
 * list创建过程会触发不同过程的钩子，并携带对应阶段的上下文，这时需要在其中嵌入生命周期
 * customNodePreffix: 创建和更新节点阶段在<位置处于下拉图标之前>的创建自定义前缀dom, 要求必须用tree-node-preffix的class类的span包裹你的preffix
 * customNodeSuffix: 创建和更新节点阶段在<位置处于title之后>的创建自定义前缀dom, 要求必须用tree-node-suffix的class类的span包裹你的suffix
 * 例如onListCreated里包装列表item的dom、在root代理绑定事件代理、在onListDestroy解绑事件
 * @typedef {'onListCreated'|'customNodePreffix'} ListHooks
 * @typedef {(data: FlatVTreeNode) => string} CustomNodePreffix
 * @typedef {(data: FlatVTreeNode) => string} CustomNodeSuffix
 * @typedef {($list: HTMLElement, $root: HTMLElement, data: FlatVTreeNode[]) => any} OnListCreated
 */

/**
 * 性能优先的虚拟滚动的树形组件
 * 1. 初次渲染采用innerHtml，后续渲染时复用dom，仅修改显示部分的dom信息
 * 2. 采用插件形式保持业务拓展性，目前支持每个node的前缀及后缀用dom字符串形式嵌入拓展插件，兼顾性能
 * 3. 插件内容在每次渲染时会重新刷新，需要在自定义插件内完全控制每次刷新显示的dom
 */
const __VirsualTree = (function () {
	/**
	 * @typedef {Object} RegisterListParam
	 * @property {HTMLElement} root
	 */

	/**
	 * @param {{root, itemHeight}} registerParams
	 * @param {VTreeNode[]} initData
	 * @param {ListPlugin[]} listPlugins
	 * @returns
	 */
	function createTree(registerParams, initData = [], listPlugins = []) {
		const { root, itemHeight } = registerParams

		/**
		 * 很大一部分情况只是点点展开折叠，不涉及数据更新的情况下无需变动，缓存一下
		 * @type {VTreeNode[]}
		 */
		let curTreeData

		/**
		 * 当前的完整拍平数据
		 * @type {FlatVTreeNode[]}
		 */
		let curData = []

		/**
		 * 当前显示部分的数据
		 * @type {FlatVTreeNode[]}
		 */
		let showingData

		/**
		 * 当前showingData在curData中的起点
		 * @type {number}
		 */
		let curStart

		/**
		 * 当前showingData在curData中的终点
		 * @type {number}
		 */
		let curEnd

		/**
		 * 缓冲区大小
		 */
		const BUFFER_SIZE = 2

		let $root = root

		root.innerHTML = `
      <div class="tree-container">
        <div class="tree-scroll">
          <div class="tree-list"></div>
        </div>
      </div>
    `

		let $container = root.querySelector(`.tree-container`)
		let $scroll = root.querySelector(`.tree-scroll`)
		let $list = root.querySelector(`.tree-list`)

		// 初始化过列表dom后就可以复用dom只改class和内容了
		let ifDomInited = false

		let rootHeight = root.offsetHeight
		let rootWidth = root.offsetWidth

		let iHeight = itemHeight
		let showCount = Math.floor(rootHeight / iHeight) + BUFFER_SIZE
		// let showCount = Math.floor(rootHeight / iHeight)
		$list.style.height = `${showCount * iHeight}px`

		let $select = null
		let selectId = ''

		/**
		 * 处于展开状态的
		 * @type {Set<key>}
		 */
		let openNodes = new Set()

		/**
		 * @type {ListPlugin[]}
		 */
		let plugins = []

		bindRoot(root)
		bindDefaultEvent()
		bindScrollEv()

		if (listPlugins?.length) {
			plugins = [...listPlugins.filter((plugin) => plugin instanceof ListPlugin)]
		}

		if (initData?.length) {
			flush(0, initData)
		}

		return {
			flush,
			bindRoot,
			getRoot,
		}

		//-------------------------------------- api------------------------------------------

		function flush(start = 0, originTreeData) {
			if (originTreeData !== undefined) {
				try {
					curTreeData = originTreeData
					curData = flatTreeData(originTreeData)
					updateShowingStart(curData, start)
				} catch (e) {
					console.error(e.stack)
					return
				}
			}

			updateScrollHeight()

			if (!ifDomInited) {
				firstFlushImpl(start)
			} else {
				flushImpl(start)
			}
		}

		function flushImpl(start = 0) {
			const children = $list?.children
			const data = curData

			if (!children?.length || !data?.length) return
			if (!data[start + showCount]) return

			try {
				for (let i = 0; i <= showCount; i++) {
					const idx = start + i
					const { key, level, title } = data[idx]
					const $child = children[i]
					const $switcher = $child.querySelector('.tree-node-switcher')
					const $preffix = $child.querySelector('.tree-node-preffix')
					const $suffix = $child.querySelector('.tree-node-suffix')

					// 更新id
					$child.id = parseKeyToId(key)

					// 更新选中状态
					$child.classList.remove('selected')
					if (selectId === key) {
						$child.classList.add('selected')
					}

					// 更新缩进
					const $indent = $child.querySelector('.tree-node-indent')
					if ($indent?.children && level !== $indent.children.length - 1) {
						$indent.innerHTML = createIndentsDomStr(level)
					}

					// 更新前缀
					$preffix.innerHTML = createPreffixsDomStr(data[idx])

					// 更新switcher 为减少dom更新 这里细致比较以剪枝
					// 有箭头但node内没children或是无箭头但node有children
					// 即当前dom内的switcher和node的children不匹配时再更新
					if ($switcher) {
						if (
							(!$switcher.children.length && data[idx]?.children?.length) ||
							($switcher.children.length && !data[idx]?.children?.length)
						) {
							$switcher.innerHTML = createSwitcherInnerDomStr(data[idx])
						}
					}

					if (openNodes.has(key)) {
						$child.classList.add('tree-switcher-open')
						$child.classList.remove('tree-switcher-close')
					} else {
						$child.classList.remove('tree-switcher-open')
						$child.classList.add('tree-switcher-close')
					}

					// 更新title
					const $title = $child.querySelector('.tree-node-title')
					$title.textContent = title

					// 更新后缀
					$suffix.innerHTML = createSuffixsDomStr(data[idx])
				}
			} catch (e) {
				console.error(e.stack)
				return
			}
		}

		function firstFlushImpl() {
			let listInner

			try {
				listInner = createListDomStr()
			} catch (e) {
				console.error(e.stack)
				return
			}

			$list.innerHTML = ''
			$list.innerHTML = listInner
			ifDomInited = true

			applyPlugins(plugins, 'onListCreated', $list, $root, curData)
		}

		function onOpen() {}

		function onClose() {}

		function parseId(nodeId) {
			return nodeId.split('jzTree')[1]
		}

		function parseKeyToId(key) {
			return `jzTree${key}`
		}

		function updateShowingStart(flatData, start) {
			const end = Math.min(start + showCount, flatData?.length ?? 0)
			if (end < start) {
				console.warn(`Invalid show data: start: ${start}, end: ${end}`)
				return
			}

			curStart = start
			curEnd = end
		}

		/**
		 *
		 * @param {VTreeNode[]} data
		 * @returns {FlatVTreeNode[]}
		 */
		function flatTreeData(data) {
			const res = []
			if (!data?.length) return res
			const keyCache = new Set()

			// dfs 先序遍历
			for (let i = 0; i < data.length; i++) {
				const stack = [{ ...data[i], level: 0 }]
				while (stack.length) {
					const cur = stack.pop()

					// 为了先序，需要反向将children入栈，以确保首个children第一个出栈，同时记录树层级level
					// 且非折叠状态的节点的子节点才能参与flat
					if (cur?.children?.length && openNodes.has(cur.key)) {
						for (let j = cur.children.length - 1; j >= 0; j--) {
							const child = cur.children[j]
							stack.push({ ...child, level: cur.level + 1 })
						}
					}

					res.push(cur)
				}
			}
			return res
		}

		function bindRoot($root) {
			$root = $root
		}

		function getRoot() {
			return $root
		}

		function bindDefaultEvent() {
			const root = $root
			root.addEventListener('click', function (event) {
				const target = event.target

				const node = target.closest('.tree-node') // 获取包含箭头元素的父列表项

				// title和switcher是互斥的，二者不会同时非空
				const switcher = target.closest('.tree-node-switcher')
				const title = target.closest('.tree-node-title')

				const id = parseId(node.id)

				if (switcher) {
					// 目的是只在点击时触发目标动画，其他时候比如展开折叠是时避免其他元素被动触发动画
					switcher.style.transition = `transform 0.3s`
					switcher.addEventListener('transitionend', () => {
						switcher.style.transition = `none`
					}, { once: true })

					if (node.classList?.contains('tree-switcher-close')) {
						openNode(id)
					} else {
						closeNode(id)
					}
				} else if (title) {
				}
			})
		}

		function bindScrollEv() {
			const scroll = $scroll,
				container = $container,
				list = $list

			const scrollHandler = throttleWithRAF((ev) => {
				let newStart = Math.floor(container.scrollTop / iHeight)

				if (newStart > curData.length - showCount) {
					newStart = curData.length - showCount - 1
				}
				if (newStart !== curStart) {
					const offsetY = container.scrollTop - (container.scrollTop % iHeight)

					list.style.transform = `translate3d(0, ${offsetY}px, 0)`
				}

				updateShowingStart(curData, newStart)
				flushImpl(newStart)
			})

			container.addEventListener('scroll', scrollHandler)
		}

		function createListDomStr() {
			if (curStart > curEnd) {
				return
			}

			const data = curData

			let str = ''

			for (let i = curStart; i <= curEnd; i++) {
				const { level, title, key } = data[i]

				// 下拉箭头
				const switcher = createSwitcherInnerDomStr(data[i])

				let nodeSwitcherClass = ` tree-switcher-close`
				if (data[i]?.children && openNodes.has(key)) {
					nodeSwitcherClass = ` tree-switcher-open`
				}

				str += `
          <div
            id="${parseKeyToId(key)}"
            class="tree-node${nodeSwitcherClass}"
            style="height: ${iHeight}px"
            >
						<span class="tree-node-indent">
							${createIndentsDomStr(level)}
						</span>
						<span class="tree-node-switcher">
							${switcher}
						</span>
            <span class="tree-node-preffix">
							${createPreffixsDomStr(data[i])}
						</span>
            <span class="tree-node-title">
						<span>${title}</span>
						</span>
            <span class="tree-node-suffix">
							${createSuffixsDomStr(data[i])}
						</span>
          </div>
        `
			}
			return str
		}

		function createIndentsDomStr(level = 0) {
			const indentTemplate = `<span class="tree-node-indent-unit"></span>`
			let indents = indentTemplate
			for (let j = 0; j < level; j++) {
				indents += indentTemplate
			}
			return indents
		}

		/**
		 * @param {FlatVTreeNode} node
		 * @returns {string}
		 */
		function createSwitcherInnerDomStr(node) {
			return node?.children?.length ? `<i class="iconfont icon-anno3d-right-outlined"></i>` : ''
		}

		/**
		 * @param {FlatVTreeNode} node
		 * @returns {string}
		 */
		function createPreffixsDomStr(node) {
			let res = ''
			for (const { customNodePreffix } of plugins) {
				if (!(customNodePreffix instanceof Function)) continue

				res += customNodePreffix(node)
			}
			return res
		}

		/**
		 * @param {FlatVTreeNode} node
		 * @returns {string}
		 */
		function createSuffixsDomStr(node) {
			let res = ''
			for (const { customNodeSuffix } of plugins) {
				if (!(customNodeSuffix instanceof Function)) continue

				res += customNodeSuffix(node)
			}
			return res
		}

		function updateScrollHeight() {
			$scroll.style.minHeight = `${curData.length * iHeight}px`
		}

		function throttleWithRAF(callback) {
			let requestId = null
			let lastArgs = null

			const throttledFunction = function (...args) {
				lastArgs = args

				if (requestId === null) {
					requestId = requestAnimationFrame(() => {
						callback(...lastArgs)
						requestId = null
					})
				}
			}

			return throttledFunction
		}

		function openNode(key) {
			if (key === undefined || key === null) {
				console.warn(`Invalid key: ${key}`)
				return
			}

			if (openNodes.has(key)) {
				return
			}

			openNodes.add(key)
			flush(curStart, curTreeData)
		}

		function closeNode(key) {
			if (key === undefined || key === null) {
				console.warn(`Invalid key: ${key}`)
				return
			}

			if (!openNodes.has(key)) {
				return
			}

			openNodes.delete(key)
			flush(curStart, curTreeData)
		}

		function selectNode(id) {
			if (selectId === id) return
			const node = $list.querySelector(`#jzTree${id}`)
			node?.classList.add('selected')
		}

		function unselectNode(id) {
			if (selectId === id) return
			const node = $list.querySelector(`#jzTree${id}`)
			node?.classList.remove('selected')
		}

		//-------------------------------------- plugins-----------------------------------------

		/**
		 * @param {listPlugins} plugins
		 * @param {ListHooks} hookType
		 * @returns
		 */
		function applyPlugins(plugins, hookType, ...args) {
			for (const plugin of plugins) {
				const hookCb = plugin[hookType]
				hookCb && hookCb instanceof Function && hookCb(...args)
			}
		}
	}


	/**
	 * @typedef {object} CreatePluginParams
	 * @property {OnListCreated|undefined} onListCreated
	 * @property {CustomNodePreffix|undefined} customNodePreffix
	 * @property {CustomNodeSuffix|undefined} customNodeSuffix
	 */

	class ListPlugin {
		/**
		 *
		 * @param {CreatePluginParams} callbacks
		 */
		constructor(callbacks) {
			this.onListCreated = callbacks.onListCreated
			this.customNodePreffix = callbacks.customNodePreffix
			this.customNodeSuffix = callbacks.customNodeSuffix
		}
	}

	/**
	 *
	 * @param {CreatePluginParams} callbacks
	 */
	function createPlugin(callbacks) {
		const onListCreated = !!callbacks?.onListCreated ? callbacks.onListCreated : null
		const customNodePreffix = !!callbacks?.customNodePreffix ? callbacks.customNodePreffix : null
		const customNodeSuffix = !!callbacks?.customNodeSuffix ? callbacks.customNodeSuffix : null

		return new ListPlugin({
			onListCreated,
			customNodePreffix,
			customNodeSuffix,
		})
	}


	return {
		createTree,
		createPlugin,
	}
})()

export default __VirsualTree
