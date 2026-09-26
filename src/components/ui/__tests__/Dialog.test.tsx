import { describe, it, expect, jest } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { Dialog } from '../Dialog';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const TITLE = 'Draggable dialog';

function getParts() {
  const title = screen.getByText(TITLE);
  const header = title.parentElement!;
  const panel = header.parentElement!;
  return { header, panel };
}

function pointer(type: string, x: number, y: number, target: Element | Window) {
  fireEvent(
    target,
    new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true }),
  );
}

function renderDialog(props: Partial<ComponentProps<typeof Dialog>> = {}) {
  const children: ReactNode = <div>Dialog body</div>;
  return render(
    <Dialog open onClose={jest.fn()} title={TITLE} draggable {...props}>
      {children}
    </Dialog>,
  );
}

describe('Dialog draggable', () => {
  it('moves the panel when dragging from the header', () => {
    renderDialog();
    const { header, panel } = getParts();

    pointer('pointerdown', 100, 100, header);
    pointer('pointermove', 150, 130, window);

    expect(panel.style.transform).toBe('translate(50px, 30px)');
    pointer('pointerup', 150, 130, window);
  });

  it('stops moving after pointerup', () => {
    renderDialog();
    const { header, panel } = getParts();

    pointer('pointerdown', 100, 100, header);
    pointer('pointermove', 150, 130, window);
    pointer('pointerup', 150, 130, window);
    pointer('pointermove', 300, 300, window);

    expect(panel.style.transform).toBe('translate(50px, 30px)');
  });

  it('does not move when the dialog is not draggable', () => {
    renderDialog({ draggable: false });
    const { header, panel } = getParts();

    pointer('pointerdown', 100, 100, header);
    pointer('pointermove', 150, 130, window);

    expect(panel.style.transform).toBe('');
  });

  it('does not start a drag from the close button', () => {
    renderDialog();
    const { panel } = getParts();
    const closeButton = screen.getByRole('button', { name: 'common.close' });

    pointer('pointerdown', 100, 100, closeButton);
    pointer('pointermove', 150, 130, window);

    expect(panel.style.transform).toBe('');
  });

  it('resets to the center when reopened', () => {
    const view = renderDialog();
    const { header, panel } = getParts();

    pointer('pointerdown', 100, 100, header);
    pointer('pointermove', 150, 130, window);
    expect(panel.style.transform).not.toBe('');

    view.rerender(
      <Dialog open={false} onClose={jest.fn()} title={TITLE} draggable>
        <div>Dialog body</div>
      </Dialog>,
    );
    view.rerender(
      <Dialog open onClose={jest.fn()} title={TITLE} draggable>
        <div>Dialog body</div>
      </Dialog>,
    );

    expect(getParts().panel.style.transform).toBe('');
  });
});
