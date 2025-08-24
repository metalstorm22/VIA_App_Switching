import {Provider} from 'react-redux';
import {useEffect} from 'react';

import {store} from '../store';
import Routes from '../Routes';
import {handleActiveAppChange} from 'src/store/appProfilesSlice';
import {Toast} from 'src/components/Toast';
import {ensureDefaultConfigurationProfileExists} from 'src/utils/device-store';

export default () => (
  <Provider store={store}>
    <RootWithAppDetector />
  </Provider>
);

const RootWithAppDetector = () => {
  useEffect(() => {
    // Ensure a Default configuration profile exists for fallback
    try { ensureDefaultConfigurationProfileExists(); } catch {}

    const unsubscribe = (window as any).desktop?.onActiveAppChanged?.(
      (data: {bundleId: string; name: string}) => {
        try {
          store.dispatch(handleActiveAppChange(data) as any);
        } catch {}
      },
    );
    return () => {
      try { unsubscribe && unsubscribe(); } catch {}
    };
  }, []);
  return (
    <>
      <Routes />
      <Toast />
    </>
  );
};
