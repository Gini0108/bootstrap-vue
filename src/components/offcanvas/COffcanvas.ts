import { defineComponent, h, ref, RendererElement, Transition, watch } from 'vue'
import { CBackdrop } from '../backdrop'

const COffcanvas = defineComponent({
  name: 'COffcanvas',
  props: {
    /**
     * Apply a backdrop on body while offcanvas is open.
     */
    backdrop: {
      type: Boolean,
      default: true,
      require: false,
    },
    /**
     * Closes the offcanvas when escape key is pressed.
     */
    keyboard: {
      type: Boolean,
      default: true,
      require: false,
    },
    /**
     * Components placement, there’s no default placement.
     *
     * @values 'start', 'end', 'top', 'bottom'
     */
    placement: {
      type: String,
      default: undefined,
      require: true,
      validator: (value: string) => {
        return ['start', 'end', 'top', 'bottom'].includes(value)
      },
    },
    /**
     * Allow body scrolling while offcanvas is open
     */
    scroll: {
      type: Boolean,
      default: false,
      required: false,
    },
    /**
     * Toggle the visibility of offcanvas component.
     */
    visible: {
      type: Boolean,
      require: false,
    },
  },
  emits: [
    /**
     * Event called before the dissmiss animation has started.
     */
    'dismiss',
  ],
  setup(props, { slots, emit }) {
    const offcanvasRef = ref()
    const visible = ref(props.visible)

    watch(
      () => props.visible,
      () => {
        visible.value = props.visible
      },
    )

    watch(visible, () => {
      if (visible.value) {
        if (!props.scroll) {
          document.body.style.overflow = 'hidden'
          document.body.style.paddingRight = '0px'
        }
        return
      }

      if (!props.scroll) {
        document.body.style.removeProperty('overflow')
        document.body.style.removeProperty('padding-right')
      }
    })

    const handleEnter = (el: RendererElement, done: () => void) => {
      el.addEventListener('transitionend', () => {
        done()
      })
      setTimeout(() => {
        el.style.visibility = 'visible'
        el.classList.add('show')
      }, 1)
    }
    const handleAfterEnter = () => {
      window.addEventListener('click', handleClickOutside)
      window.addEventListener('keyup', handleKeyUp)
    }
    const handleLeave = (el: RendererElement, done: () => void) => {
      el.addEventListener('transitionend', () => {
        done()
      })
      el.classList.remove('show')
    }
    const handleAfterLeave = (el: RendererElement) => {
      el.style.visibility = 'hidden'
      window.removeEventListener('click', handleClickOutside)
      window.removeEventListener('keyup', handleKeyUp)
    }

    const handleDismiss = () => {
      visible.value = false
      emit('dismiss')
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (offcanvasRef.value && !offcanvasRef.value.contains(event.target as HTMLElement)) {
        if (event.key === 'Escape' && props.keyboard) {
          return handleDismiss()
        }
      }
    }
    const handleClickOutside = (event: Event) => {
      if (offcanvasRef.value && !offcanvasRef.value.contains(event.target as HTMLElement)) {
        handleDismiss()
      }
    }

    return () => [
      h(
        Transition,
        {
          onEnter: (el, done) => handleEnter(el, done),
          onAfterEnter: () => handleAfterEnter(),
          onLeave: (el, done) => handleLeave(el, done),
          onAfterLeave: (el) => handleAfterLeave(el),
        },
        () =>
          visible.value &&
          h(
            'div',
            {
              class: [
                'offcanvas',
                {
                  [`offcanvas-${props.placement}`]: props.placement,
                },
              ],
              ref: offcanvasRef,
              role: 'dialog',
            },
            slots.default && slots.default(),
          ),
      ),
      props.backdrop &&
        h(CBackdrop, {
          class: 'modal-backdrop',
          visible: visible.value,
        }),
    ]
  },
})

export { COffcanvas }
