import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
    this.open = true;
  };

  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    if (!this.open) {
      return;
    }

    this.open = false;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

setupZonelessTestEnv();
