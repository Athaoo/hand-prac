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

		/**@type {VTreeNode[]} */
		let _curData = []
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

		let rootHeight = root.offsetHeight
		let rootWidth = root.offsetWidth

		let iHeight = itemHeight
		let showCount = Math.floor(rootHeight / iHeight)

		let $select = null
		let selectId = ''

		let folds = new Map()

		let plugins = []

		bindRoot(root)
		_bindScrollEv()

		if (listPlugins?.length) {
			plugins = [...listPlugins.filter((plugin) => plugin instanceof ListPlugin)]
		}

		if (initData?.length) {
			flush(initData)
		}

		return {
			flush,
			bindRoot,
			getRoot,
		}

		//-------------------------------------- api------------------------------------------

		function flush(data) {
			let listInner

			try {
				_curData = _flatTreeData(data)
				console.log(`🚀 -> flush -> _curData:`, _curData)

				_updateScrollHeight()
				listInner = _createListDomStr(0)
			} catch (e) {
				console.error(e.stack)
				return
			}

			// applyPlugins(plugins, $list, _$root, 'onDestroy')

			_$list.innerHTML = ''
			_$list.innerHTML = listInner

			// applyPlugins(plugins, $list, _$root, 'onListCreated')
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
					if (cur?.children?.length) {
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

		function _bindScrollEv() {
			const scroll = _$scroll,
				container = _$container,
				list = _$list

			const scrollHandler = throttleWithRAF((ev) => {
				const start = Math.floor(container.scrollTop / iHeight)

				if (start >= _curData.length - showCount) {
					return
				}

				const offsetY = container.scrollTop - (container.scrollTop % iHeight)

				// list.style.marginTop = `${offsetY}px`
				list.style.transform = `translate3d(0, ${offsetY}px, 0)`

				const inner = _createListDomStr(start)
				list.innerHTML = inner
			})

			container.addEventListener('scroll', scrollHandler)
		}

		function _createListDomStr(start, bufferSize = 4) {
			const max = Math.min(start + showCount + bufferSize, _curData?.length ?? 0)

			let str = ''

			for (let i = start; i < max; i++) {
				str += `
          <div
            id="jzTree_${_curData[i].title}"
            class="tree-list-item"
            style="height: ${iHeight}px"
            >
            ${_curData[i].title}
          </div>
        `
			}
			return str
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
