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
 * list创建过程会触发不同过程的钩子，并携带对应阶段的上下文，这时需要在其中嵌入生命周期操作
 * 例如onListCreated里包装列表item的dom、在root代理绑定事件代理、在onListDestroy解绑事件
 * @typedef {'onListCreated'|'onDestroy'} ListHooks
 * @typedef {($list: HTMLElement, $root: HTMLElement, data: VTreeNode[]) => any} OnListCreated
 * @typedef {($list: HTMLElement, $root: HTMLElement, data: VTreeNode[]) => any} OnDestroy
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
		let _curTreeData

		/**
		 * 当前的完整拍平数据
		 * @type {FlatVTreeNode[]}
		 */
		let _curData = []

		/**
		 * 当前显示部分的数据
		 * @type {FlatVTreeNode[]}
		 */
		let _showingData

		/**
		 * 当前showingData在curData中的起点
		 * @type {number}
		 */
		let _curStart

		/**
		 * 当前showingData在curData中的终点
		 * @type {number}
		 */
		let _curEnd

		/**
		 * 缓冲区大小
		 */
		const bufferSize = 2

		let _$root = root

		root.innerHTML = `
      <div class="tree-container">
        <div class="tree-scroll">
          <div class="tree-list"></div>
        </div>
      </div>
    `

		let _$container = root.querySelector(`.tree-container`)
		let _$scroll = root.querySelector(`.tree-scroll`)
		let _$list = root.querySelector(`.tree-list`)

		// 初始化过列表dom后就可以复用dom只改class和内容了
		let ifDomInited = false

		let rootHeight = root.offsetHeight
		let rootWidth = root.offsetWidth

		let iHeight = itemHeight
		let showCount = Math.floor(rootHeight / iHeight) + bufferSize
		// let showCount = Math.floor(rootHeight / iHeight)
		_$list.style.height = `${showCount * iHeight}px`

		let $select = null
		let selectId = ''

		/**
		 * 处于展开状态的
		 * @type {Set<key>}
		 */
		let openNodes = new Set()

		let plugins = []

		bindRoot(root)
		_bindDefaultEvent()
		_bindScrollEv()

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
					_curTreeData = originTreeData
					_curData = _flatTreeData(originTreeData)
					_updateShowingStart(_curData, start)
				} catch (e) {
					console.error(e.stack)
					return
				}
			}

			_updateScrollHeight()

			if (!ifDomInited) {
				firstFlushImpl(start)
			} else {
				flushImpl(start)
			}
		}

		function flushImpl(start = 0) {
			const children = _$list?.children
			const data = _curData

			if (!children?.length || !data?.length) return
			if (!data[start + showCount]) return

			try {
				for (let i = 0; i <= showCount; i++) {
					const { key, level, title } = data[start + i]
					const $child = children[i]
					const $switcher = $child.querySelector('.tree-node-switcher')

					// 更新id
					$child.id = parseKeyToId(key)

					// 更新选中状态
					$child.classList.remove('selected')
					if (selectId === key) {
						$child.classList.add('selected')
					}

					// 更新switcher
					if (openNodes.has(key)) {
						$child.classList.remove('tree-switcher-close')
						$child.classList.add('tree-switcher-open')
					} else {
						$child.classList.remove('tree-switcher-open')
						$child.classList.add('tree-switcher-close')
					}

					// 更新缩进
					const $indent = $child.querySelector('.tree-node-indent')
					if ($indent?.children && level !== $indent.children.length - 1) {
						$indent.innerHTML = _createIndentsDomStr(level)
					}

					// 更新title
					const $title = $child.querySelector('.tree-node-title')
					$title.textContent = title
				}
			} catch (e) {
				console.error(e.stack)
				return
			}
		}

		function firstFlushImpl() {
			let listInner

			try {
				listInner = _createListDomStr()
			} catch (e) {
				console.error(e.stack)
				return
			}

			// applyPlugins(plugins, $list, _$root, 'onDestroy')

			_$list.innerHTML = ''
			_$list.innerHTML = listInner
			ifDomInited = true

			// applyPlugins(plugins, $list, _$root, 'onListCreated')
		}

		function onOpen() {}

		function onClose() {}

		function parseId(nodeId) {
			return nodeId.split('jzTree_')[1]
		}

		function parseKeyToId(key) {
			return `jzTree_${key}`
		}

		function _updateShowingStart(flatData, start) {
			const end = Math.min(start + showCount, flatData?.length ?? 0)
			if (end < start) {
				console.warn(`Invalid show data: start: ${start}, end: ${end}`)
				return
			}

			_curStart = start
			_curEnd = end
		}

		/**
		 *
		 * @param {VTreeNode[]} data
		 * @returns {FlatVTreeNode[]}
		 */
		function _flatTreeData(data) {
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
			_$root = $root
		}

		function getRoot() {
			return _$root
		}

		function _bindDefaultEvent() {
			const root = _$root
			root.addEventListener('click', function (event) {
				const target = event.target

				const node = target.closest('.tree-node') // 获取包含箭头元素的父列表项

				// title和switcher是互斥的，二者不会同时非空
				const switcher = target.closest('.tree-node-switcher')
				const title = target.closest('.tree-node-title')

				const id = parseId(node.id)

				if (switcher) {
					if (node.classList?.contains('tree-switcher-close')) {
						openNode(id)
					} else {
						closeNode(id)
					}
				} else if (title) {
				}
			})
		}

		function _bindScrollEv() {
			const scroll = _$scroll,
				container = _$container,
				list = _$list

			const scrollHandler = throttleWithRAF((ev) => {
				let newStart = Math.floor(container.scrollTop / iHeight)

				if (newStart > _curData.length - showCount) {
					newStart = _curData.length - showCount - 1
				}
				if (newStart !== _curStart) {
					const offsetY = container.scrollTop - (container.scrollTop % iHeight)

					list.style.transform = `translate3d(0, ${offsetY}px, 0)`
				}


				_updateShowingStart(_curData, newStart)
				flushImpl(newStart)
			})

			container.addEventListener('scroll', scrollHandler)
		}

		function _createListDomStr() {
			if (_curStart > _curEnd) {
				return
			}

			const data = _curData

			let str = ''

			for (let i = _curStart; i <= _curEnd; i++) {
				const { level, title, key } = data[i]

				// 下拉箭头
				let switcher,
					nodeSwitcherClass = ` tree-switcher-close`
				if (data[i]?.children) {
					if (openNodes.has(key)) {
						nodeSwitcherClass = ` tree-switcher-open`
					}
					switcher = `<i class="iconfont icon-anno3d-right-outlined"></i>`
				} else {
					switcher = ''
				}

				str += `
          <div
            id="${parseKeyToId(key)}"
            class="tree-node${nodeSwitcherClass}"
            style="height: ${iHeight}px"
            >
						<span class="tree-node-indent">
							${_createIndentsDomStr(level)}
						</span>
						<span class="tree-node-switcher">
							${switcher}
						</span>
            <span class="tree-node-title">
							<span>${title}</span>
						</span>
          </div>
        `
			}
			return str
		}

		function _createIndentsDomStr(level = 0) {
			const indentTemplate = `<span class="tree-node-indent-unit"></span>`
			let indents = indentTemplate
			for (let j = 0; j < level; j++) {
				indents += indentTemplate
			}
			return indents
		}

		function _updateScrollHeight() {
			_$scroll.style.minHeight = `${_curData.length * iHeight}px`
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
			flush(_curStart, _curTreeData)
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
			flush(_curStart, _curTreeData)
		}

		function selectNode(id) {
			if (selectId === id) return
			const node = _$list.querySelector(`#jzTree_${id}`)
			node?.classList.add('selected')
		}

		function unselectNode(id) {
			if (selectId === id) return
			const node = _$list.querySelector(`#jzTree_${id}`)
			node?.classList.remove('selected')
		}

		//-------------------------------------- inner-----------------------------------------

		/**
		 * @param {listPlugins} plugins
		 * @param {HTMLElement} $list
		 * @param {HTMLElement} $root
		 * @param {ListHooks} hookType
		 * @returns
		 */
		function applyPlugins(plugins, $list, $root, hookType) {
			if (!$list instanceof HTMLElement) throw Error(`Invalid list ${$list}`)
			if (!$root instanceof HTMLElement) throw Error(`Invalid list ${$root}`)

			if (!plugins?.length) {
				return $list
			}

			for (const plugin of plugins) {
				const hookCb = plugin[hookType]
				hookCb && hookCb instanceof Function && hookCb($list, $root, _curData)
			}

			return $list
		}
	}

	/** list plugins  */

	class ListPlugin {
		/**
		 *
		 * @param {OnListCreated} onListCreated
		 * @param {OnDestroy} onDestroy
		 */
		constructor(onListCreated, onDestroy) {
			this.onListCreated = onListCreated
			this.onDestroy = onDestroy
		}
	}

	/**
	 *
	 * @param {OnListCreated} onListCreated
	 * @param {OnDestroy} onDestroy
	 */
	function createPlugin(onListCreated, onDestroy) {
		onListCreated = !!onListCreated ? onListCreated : () => {}
		onDestroy = !!onDestroy ? onDestroy : () => {}

		return new ListPlugin(onListCreated, onDestroy)
	}

	return {
		createTree,
		createPlugin,
	}
})()

export default __VirsualTree
