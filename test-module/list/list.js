/**
 * @typedef {Object} listItem
 * @property {string} id
 * @property {string} text
 * @property {listItem[]|null} children
 * @property {HTMLElement} el
 */

/**
 * list创建过程会触发不同过程的钩子，并携带对应阶段的上下文，这时需要在其中嵌入生命周期操作
 * 例如onListCreated里包装列表item的dom、在root代理绑定事件代理、在onListDestroy解绑事件
 * @typedef {'onListCreated'|'onDestroy'} ListHooks
 * @typedef {($list: HTMLElement, $root: HTMLElement, data: listItem[]) => any} OnListCreated
 * @typedef {($list: HTMLElement, $root: HTMLElement, data: listItem[]) => any} OnDestroy
 */

const __List = (function () {
	/**
	 * @typedef {Object} RegisterListParam
	 * @property {HTMLElement} root
	 */

	/**
	 * @param {RegisterListParam} registerParams
	 * @param {listItem[]} initData
	 * @param {ListPlugin[]} listPlugins
	 * @returns
	 */
	function createList(registerParams, initData = [], listPlugins = []) {
		const { root } = registerParams

		let _curData = []
		let _$root = null
		let _$list = null

		/** .li-head */
		let $select = null
		let selectId = ''

		let folds = new Map()

		let plugins = []

		let idCache = null

		bindRoot(root)
		_bindDefaultEvent(root)

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
			fold,
			unfold,
			select,
			unselect,
		}

		//-------------------------------------- api------------------------------------------

		function flush(data) {
			_curData = data
			let $list

			try {
				idCache = new Set()
				$list = createListDom(data)
			} catch (e) {
				throw e
			} finally {
				idCache = null
			}

			applyPlugins(plugins, $list, _$root, 'onDestroy')
			_$root.innerHTML = ''
			_$root.appendChild($list)

			applyPlugins(plugins, $list, _$root, 'onListCreated')
			_$list = $list
		}

		function bindRoot($root) {
			_$root && (_$root.innerHTML = '')

			_$root = $root
		}

		function getRoot() {
			return _$root
		}

		function getLi(id) {
			return _$list.querySelector(`.li[data-li-id="${id}"]`) ?? null
		}

		function getIdByLi(li) {
			return li?.dataset?.liId
		}

		function fold(id) {
			_fold(getLi(id))
		}

		function unfold(id) {
			_unfold(getLi(id))
		}

		/**
		 * id或者li标签
		 * @param {HTMLElement|string} item
		 * @returns
		 */
		function select(item) {
			if (!item instanceof HTMLElement || !typeof item == 'string') return
			if (selectId == item) return

			let liHead, id
			if (item instanceof HTMLElement && item.classList.contains('li')) {
				// li标签
				liHead = item.querySelector('.li-head')
				id = getIdByLi(item)
			} else {
				// id
				id = item
				liHead = getHead(id)
			}

			if (liHead) {
				unselect()
				unfold(id)
				liHead.classList.add('selected')

				$select = liHead
				selectId = id
			}
		}

		function unselect() {
			$select?.classList.remove('selected')
			selectId = null
		}

		//-------------------------------------- inner-----------------------------------------
		function getClosestLi(el) {
			return el?.closest('.li') ?? null
		}

		function getHead(id) {
			return getLi(id)?.querySelector('.li-body > .li-head')
		}

		function _bindDefaultEvent(root) {
			root.addEventListener('click', function (event) {
				const target = event.target

				const listItem = target.closest('.li') // 获取包含箭头元素的父列表项

				if (target.classList.contains('li-arrow')) {
					if (listItem) {
						_foldHandler(listItem)
					}
				} else if (target.classList.contains('li-text')) {
					// 点击到文字才选中
					select(listItem)
				}
			})
		}

		/**
		 *
		 * @param {HTMLElement} li
		 * @returns
		 */
		function _foldHandler(li) {
			const inner = li?.querySelector('.li-inner')
			if (!li || !li instanceof HTMLElement || !inner) return

			if (!inner.classList?.contains('folded')) {
				_fold(li)
			} else {
				_unfold(li)
			}
		}

		/** 将本体和子项全部折叠 */
		function _fold(li) {
			if (!li || !li instanceof HTMLElement) return

			const inner = li.querySelector('.li-inner')
			const innerSubLis = inner?.querySelectorAll('.li')

			const icon = li.querySelector('.li-arrow')
			handleArrowIcon(icon, true)

			innerSubLis?.forEach((li) => _fold(li))
			inner?.classList.add('folded')
		}

		/** 从本体向父节点递归全部展开 */
		function _unfold(li) {
			if (!li || !li instanceof HTMLElement) return

			const inner = li.querySelector('.li-inner')
			inner?.classList.remove('folded')

			const icon = li.querySelector('.li-arrow')
			handleArrowIcon(icon, false)

			const parLi = li.parentNode?.closest('.li')
			!!parLi && parLi !== li && _unfold(parLi)
		}

		function handleArrowIcon(i, isFold = true) {
			if (!i instanceof HTMLElement) return

			if (isFold) {
				i?.classList.add('folded')
			} else {
				i?.classList.remove('folded')
			}
		}

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

		/**
		 * @param {listItem[]} data
		 * @returns
		 */
		function createListDom(data) {
			const $list = document.createElement('div')

			let ul = createListStrImpl(data)
			$list.innerHTML = ul

			return $list
		}

		function createListStrImpl(data) {
			if (!data?.length) return ''

			const lis = data.reduce((pre, item) => {
				if (idCache.has(item.id)) {
					throw Error(`Dulplicated id ${item.id}, check your list data`)
				}
				const li = `
					<div data-li-id="${item.id}" class="li">
						<div class="li-body">
							<div class="li-head">
								<div class="li-pre">
									<div>
										<i class="${item.children?.length ? 'iconfont icon-anno3d-right-outlined' : ''} li-arrow folded"></i>
									</div>
								</div>
								<div class="li-text">${item.text}</div>
								<div class="li-end"></div>
							</div>
							${
								item.children?.length
									? `<div class="li-inner folded">
										${createListStrImpl(item.children)}
									</div>`
									: ''
							}
						</div>
					</div>
				`
				return `
						${pre}
						${li}
				`
			}, [])

			return `
				<div class="ul">
					${lis}
				</div>
			`
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
		createList,
		createPlugin,
	}
})()

globalThis.__List = __List

export default __List
