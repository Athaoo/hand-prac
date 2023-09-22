import List from './list.js'
import { generateRandomData } from './mock.js'

const { createList, createPlugin } = List

const root = document.getElementById('segRoot')

const handler = (ev) => {
	const target = ev.target

	if (ifClickEye(target)) {
		toggleEye(target)
	} else if (ifClickLock(target)) {
		toggleLock(target)
	}

	const li = target.closest('.li')
	if (li) {
	}

	function ifClickEye(target) {
		return target.tagName === 'I' && (isEyeOn(target) || isEyeOff(target))
	}

	function toggleEye(icon, ifOn) {
		if (isEyeOn(icon)) {
			icon?.classList.remove('icon-anno3d-eye-open-outlined')
			icon?.classList.add('icon-anno3d-eye-close-outlined')
			icon?.classList.add('gray')
		} else if (isEyeOff(icon)) {
			icon?.classList.remove('gray')
			icon?.classList.remove('icon-anno3d-eye-close-outlined')
			icon?.classList.add('icon-anno3d-eye-open-outlined')
		}
	}
	function isEyeOn(icon) {
		return icon?.classList.contains('icon-anno3d-eye-open-outlined')
	}
	function isEyeOff(icon) {
		return icon?.classList.contains('icon-anno3d-eye-close-outlined')
	}

	function ifClickLock(icon) {
		return target.tagName === 'I' && (isLockOn(target) || isLockOff(target))
	}

	function toggleLock(icon) {
		if (isLockOn(icon)) {
      icon?.classList.remove('gray')
      icon?.classList.remove('icon-anno3d-lock-outlined')
			icon?.classList.add('icon-anno3d-unlock-outlined')
		} else if (isLockOff(icon)) {
			icon?.classList.add('icon-anno3d-lock-outlined')
      icon?.classList.add('gray')
			icon?.classList.remove('icon-anno3d-unlock-outlined')
		}
	}
	function isLockOn(icon) {
		return icon?.classList.contains('icon-anno3d-lock-outlined')
	}
	function isLockOff(icon) {
		return icon?.classList.contains('icon-anno3d-unlock-outlined')
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
		if (!$pre) return

		if ($inner) {
			$inner.style.paddingLeft = '3rem'
		}
		let preInner = $pre.innerHTML

		preInner = `
      <div><i class="iconfont icon-anno3d-eye-open-outlined"></i></div>
      <div><i class="iconfont icon-anno3d-lock-outlined"></i></div>
      ${preInner}
    `
		$pre.innerHTML = preInner
	})
}

const onDestroy = ($list, $root, data = []) => {
	$root?.removeEventListener('click', handler)
}

const segPlugin = createPlugin(onCreate, onDestroy)

const mock = generateRandomData(10, 0)
const list = createList({ root }, mock, [segPlugin])
