import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GameControls from '../GameControls.vue'

vi.mock('@/components/modals/NewGameModal.vue', () => ({
  default: {
    name: 'NewGameModal',
    props: ['isOpen'],
    emits: ['close'],
    template: '<div data-testid="new-game-modal" v-if="isOpen">New Game Modal</div>',
  },
}))

vi.mock('@/components/modals/ResultsModal.vue', () => ({
  default: {
    name: 'ResultsModal',
    props: ['isOpen'],
    emits: ['close'],
    template: '<div data-testid="results-modal" v-if="isOpen">Results Modal</div>',
  },
}))

describe('GameControls', () => {
  it('should render both buttons', () => {
    const wrapper = mount(GameControls)

    const newGameButton = wrapper.find('button:first-child')
    const resultsButton = wrapper.find('button:last-child')

    expect(newGameButton.exists()).toBe(true)
    expect(resultsButton.exists()).toBe(true)
    expect(newGameButton.text()).toContain('New Game')
    expect(resultsButton.text()).toContain('Results')
  })

  it('should open new game modal when New Game button is clicked', async () => {
    const wrapper = mount(GameControls)

    expect(wrapper.find('[data-testid="new-game-modal"]').exists()).toBe(false)

    const newGameButton = wrapper.find('button:first-child')
    await newGameButton.trigger('click')

    expect(wrapper.find('[data-testid="new-game-modal"]').exists()).toBe(true)
  })

  it('should open results modal when Results button is clicked', async () => {
    const wrapper = mount(GameControls)

    expect(wrapper.find('[data-testid="results-modal"]').exists()).toBe(false)

    const resultsButton = wrapper.find('button:last-child')
    await resultsButton.trigger('click')

    expect(wrapper.find('[data-testid="results-modal"]').exists()).toBe(true)
  })

  it('should close new game modal when close event is emitted', async () => {
    const wrapper = mount(GameControls)

    const newGameButton = wrapper.find('button:first-child')
    await newGameButton.trigger('click')
    expect(wrapper.find('[data-testid="new-game-modal"]').exists()).toBe(true)

    const modal = wrapper.findComponent({ name: 'NewGameModal' })
    await modal.vm.$emit('close')

    expect(wrapper.find('[data-testid="new-game-modal"]').exists()).toBe(false)
  })

  it('should close results modal when close event is emitted', async () => {
    const wrapper = mount(GameControls)

    const resultsButton = wrapper.find('button:last-child')
    await resultsButton.trigger('click')
    expect(wrapper.find('[data-testid="results-modal"]').exists()).toBe(true)

    const modal = wrapper.findComponent({ name: 'ResultsModal' })
    await modal.vm.$emit('close')

    expect(wrapper.find('[data-testid="results-modal"]').exists()).toBe(false)
  })

  it('should have proper CSS classes for styling', () => {
    const wrapper = mount(GameControls)

    const container = wrapper.find('div:first-child')
    const newGameButton = wrapper.find('button:first-child')
    const resultsButton = wrapper.find('button:last-child')

    expect(container.classes()).toContain('rounded-lg')
    expect(newGameButton.classes()).toContain('bg-gradient-to-br')
    expect(resultsButton.classes()).toContain('bg-gradient-to-br')
  })
})
