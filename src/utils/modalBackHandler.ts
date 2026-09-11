type CloseHandler = () => void;
const modalStack: CloseHandler[] = [];

/**
 * Registers a modal or drawer close handler onto the native back stack.
 * Returns an unregister function to call on unmount/close.
 */
export function registerModal(onClose: CloseHandler): () => void {
  modalStack.push(onClose);
  return () => {
    const index = modalStack.lastIndexOf(onClose);
    if (index !== -1) {
      modalStack.splice(index, 1);
    }
  };
}

/**
 * Closes the topmost active modal if one exists.
 * Returns true if a modal was handled and dismissed, false otherwise.
 */
export function popModal(): boolean {
  if (modalStack.length > 0) {
    const closeFn = modalStack.pop();
    if (closeFn) {
      closeFn();
      return true;
    }
  }
  return false;
}

export function hasOpenModals(): boolean {
  return modalStack.length > 0;
}
