import { Tray, Menu, nativeImage, app } from 'electron';
import { showWindow, toggleWindow } from './window';

let tray: Tray | null = null;

export function createTray(): void {
  // Create a simple 16x16 icon programmatically
  const icon = nativeImage.createFromBuffer(
    Buffer.from(createTrayIconPNG()),
    { width: 16, height: 16 }
  );

  tray = new Tray(icon);
  tray.setToolTip('Terminevity');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => toggleWindow(),
    },
    { type: 'separator' },
    {
      label: 'New Terminal',
      click: () => {
        showWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow());
}

function createTrayIconPNG(): Buffer {
  // Minimal 16x16 PNG with a "T" shape (transparent background, white foreground)
  // This is a valid minimal PNG
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVQ4T2P8z8BQz0BAwMDAwMDIQCRgYGBg' +
    '+M/AUM/AwEBkGKAaMGrAqAGjBpBsAABnlQgRMYbBpgAAAABJRU5ErkJggg==',
    'base64'
  );
  return png;
}
