import List from './list.js'
import { mock1, mock2, generateRandomData } from './mock.js'

const { createList, createPlugin } = List

const root = document.getElementById('root')

const handler = (ev) => {
  const li = ev.target.closest('.li')
  if (li) {
  }
}

const onCreate = ($list, $root, data = []) => {
  $root.addEventListener('click', handler)

  // 仅包装深度为1的表层item
	data.forEach(({ id }) => {
		const $li = $list.querySelector(`.li[data-li-id="${id}"]`)
		if (!$li) return

		const $pre = $list.querySelector(`.li[data-li-id="${id}"] .li-pre`)
		const $inner = $list.querySelector(`.li[data-li-id="${id}"] > .li-body > .li-inner`)
		const $end = $list.querySelector(`.li[data-li-id="${id}"] > .li-body > .li-head > .li-end`)
		if (!$pre || !$end) return

    if ($inner) {
      $inner.style.paddingLeft = '3rem'
    }
		let preInner = $pre.innerHTML
		let endInner = $end.innerHTML

		preInner = `
      <div class="flex"><input class="m-0" type="checkbox"></div>
      <div><i class="iconfont icon-anno3d-eye-open-outlined"></i></div>
      <div><i class="iconfont icon-anno3d-lock-outlined"></i></div>
      ${preInner}
    `

		endInner = `
      <div><i class="iconfont icon-anno3d-delete-a-outlined"></i></div>
      ${endInner}
    `
		$pre.innerHTML = preInner
		$end.innerHTML = endInner
	})
}

const onDestroy = ($list, $root, data = []) => {
  $root?.removeEventListener('click', handler)
}

const annoPlugin = createPlugin(onCreate, onDestroy)

const list = createList({ root }, mock1, [annoPlugin])

document.querySelector('#btn').addEventListener('click', () => {
  list.flush(generateRandomData(30, 3))
  list.unfold('3-2-1')
})
