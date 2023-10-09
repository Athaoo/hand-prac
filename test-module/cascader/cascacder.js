/** @typedef {string|number} CascaderNodeValue*/
/** @typedef {{ label: string , value: CascaderNodeValue, children?: CascaderNode[]}} CascaderNode*/

/**
 * 目前存在的问题
 * tree-node的id唯一表示单个级联树节点的id, 不同root下的树节点cas-id可能会重复
 * 比如一个两个不同级联组件下的tree-node"北京市/昌平区"和"车/三轮车"的data-cas-id都可能是"1-1"
 * 解决的办法是在自己的root下querySelector就不会获取到重复节点了
 */
const __Cascader = (function () {
	/**
	 * @typedef {Object} RegisterCascaderParam
	 * @property {HTMLElement} root
	 */

	/**
	 *
	 * @param {RegisterCascaderParam} registerParams
	 * @param {CascaderNode[]} initData
	 * @param {*} plugins
	 */
	function createCascader(registerParams, initData = [], initSelects = [], plugins) {
		/**
		 * 原始树的数据
		 * @type {CascaderNode[]}
		 */
		let originData

		/**
		 * 当前渲染的数据，结构与原始树不同，经由原始树+选中节点计算而来
		 * curRenderData[i]代表第i级节点列表
		 * curRenderData[i][j]代表第i级节点列表的第j个
		 * @type {CascaderNode[][]}
		 */
		let curRenderData

		/**
		 * curSelects[i]的值x代表第i级节点列表中选中的第x个
		 * @type {number[]}
		 */
		let curSelects = []

		let $root
		let $input
		let $body

		const { root } = registerParams

		bindRoot(root)
		root.innerHTML = `
      <div class="cascader3d-container">
        <div class="cascader3d-input-container">
          <input value="" readonly/>
        </div>
        <div class="cascader3d-body">
        </div>
      </div>
    `

		$body = root.querySelector(`.cascader3d-body`)
		$input = root.querySelector(`.cascader3d-input-container > input`)

		bindDefaultClickEv()

		if (initData.length) {
			flush(initData, initSelects?.length ? initSelects : [])
		}

		return {
			flush,
			bindRoot,
			getRoot,
			updateSelects,
			dispose,
		}

		function flush(newOriginData = [], selects = []) {
      updateOriginData(newOriginData)
      updateSelects(selects)
			flushRenderData()
			flushDom()
		}

		function flushDom() {
			const renderData = curRenderData,
				selects = curSelects

			const levelsStr = renderData.reduce((preStr, data, level) => {
				return preStr + createLevelColStr(level)
			}, '')

			$body.innerHTML = levelsStr

      // 选择了叶子节点时
      if (selects.length === renderData.length) {
        $input.value = stringifySelects()
      }

			function createLevelColStr(level) {
				const levelData = renderData[level]

				const lis = levelData.reduce((preLisStr, node, i) => {
					const isSelected = selects[level] === i

					// id唯一表示树节点的id, 不同root下的树节点cas-id会重复
					// 解决的办法是在自己的root下querySelector就不会获取到重复节点了
					preLisStr += `
            <div data-cas-id="${level}-${i}" class="tree-node${isSelected ? ' selected' : ''}">
              ${node.label}
            </div>
          `

					return preLisStr
				}, '')

				return lis !== ''
					? `
              <div data-cas-level="${level}" class="cascader3d-menu">${lis}</div>
            `
					: ''
			}
		}

		function flushRenderData() {
			// 一级节点始终要渲染
			const newRenderData = [[...originData]]

			let nodes = originData
			for (let level = 0; level < curSelects.length; level++) {
        // 第level层级被选中的节点是node
				const node = nodes[curSelects[level]]

				if (!node) {
					throw Error(`Can't find cascader node, value: ${val} in level ${level}`)
				}

        // 最后一层时没有子节点了
				nodes = node.children
				nodes?.length && (newRenderData[level + 1] = [...nodes])
			}

			curRenderData = newRenderData
		}

		function updateOriginData(data) {
			originData = data
		}

		function updateSelects(selects) {
			curSelects = selects
		}

		function bindDefaultClickEv() {
      $root.addEventListener('click', (ev) => {
        const target = ev.target
        handler(target)
      })

      function handler(target) {
        const node = target?.closest('.tree-node')
        if (!node) return


        const casId = node.dataset.casId
        const [level, idxInsideLevel] = parseCasId(casId)

        let i = 0, newSelects = []
        while (i < level) {
          newSelects[i] = curSelects[i]
          i++
        }
        newSelects[level] = idxInsideLevel

        updateSelects(newSelects)
        flushRenderData()
        flushDom()
      }

      function parseCasId(casId) {
        const [level, idxInsideLevel] = casId.split('-')
        return [parseInt(level), parseInt(idxInsideLevel)]
      }
    }

    function stringifySelects() {
      return curSelects.map((i, level) => curRenderData[level][i].value).join('/')
    }

		function bindRoot(root) {
			$root = root
		}

		function getRoot() {
			return $root
		}

		function dispose() {}
	}

	return {
		createCascader,
	}
})()

export default __Cascader
