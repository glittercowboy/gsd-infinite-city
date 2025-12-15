export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

const inputState: InputState = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

export function initInput(): void {
  window.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        inputState.forward = true;
        break;
      case 's':
      case 'arrowdown':
        inputState.backward = true;
        break;
      case 'a':
      case 'arrowleft':
        inputState.left = true;
        break;
      case 'd':
      case 'arrowright':
        inputState.right = true;
        break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        inputState.forward = false;
        break;
      case 's':
      case 'arrowdown':
        inputState.backward = false;
        break;
      case 'a':
      case 'arrowleft':
        inputState.left = false;
        break;
      case 'd':
      case 'arrowright':
        inputState.right = false;
        break;
    }
  });
}

export function getInputState(): InputState {
  return inputState;
}
