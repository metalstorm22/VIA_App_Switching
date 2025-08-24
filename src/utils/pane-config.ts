import {faBrush, faBug, faGear, faKeyboard, faStethoscope} from '@fortawesome/free-solid-svg-icons';
import {ConfigurePane} from '../components/panes/configure';
import {Debug} from '../components/panes/debug';
import {DesignTab} from '../components/panes/design';
import {Settings} from '../components/panes/settings';
import {Test} from '../components/panes/test';
import {ErrorsPaneConfig} from '../components/panes/errors';
import {AppProfilesPane} from 'src/components/panes/app-profiles';

export default [
  {
    key: 'default',
    component: ConfigurePane,
    icon: faKeyboard,
    title: 'Configure',
    path: '/',
  },
  {
    key: 'app-profiles',
    component: AppProfilesPane,
    icon: faGear,
    path: '/app-profiles',
    title: 'App Profiles',
  },
  {
    key: 'test',
    component: Test,
    icon: faStethoscope,
    path: '/test',
    title: 'Key Tester',
  },
  {
    key: 'design',
    component: DesignTab,
    icon: faBrush,
    path: '/design',
    title: 'Design',
  },
  {
    key: 'settings',
    component: Settings,
    icon: faGear,
    path: '/settings',
    title: 'Settings',
  },
  {
    key: 'debug',
    icon: faBug,
    component: Debug,
    path: '/debug',
    title: 'Debug',
  },
  ErrorsPaneConfig,
];
