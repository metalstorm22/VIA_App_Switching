export {}; // ensure this file is a module

declare global {
  interface DesktopAPI {
    getOpenAtLogin(): Promise<boolean>;
    setOpenAtLogin(enabled: boolean): Promise<boolean>;
    allowHIDForVPID(vendorId: number, productId: number): Promise<boolean>;
    getActiveApp(): Promise<{bundleId: string; name: string} | null>;
    listApps(): Promise<Array<{bundleId: string; name: string; path: string}>>;
    onActiveAppChanged(
      cb: (data: {bundleId: string; name: string}) => void,
    ): () => void;
  }
  interface Window {
    desktop?: DesktopAPI;
  }
}
