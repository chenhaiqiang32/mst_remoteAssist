import localeMessageBox from '@/components/message-box/locale/en-US';
import localPassword from '@/components/password/locale/en-US';
import localAssist from '@/components/meeting/locale/en-US';
import localArQrCode from '@/components/ar-qr-code/locale/en-US';
import localeLogin from '@/views/login/locale/en-US';
import localeMeeting from '@/views/meeting/locale/en-US';
import localeRecord from '@/views/record/locale/en-US';
import localAddress from '@/views/address/locale/en-US';
import localMessage from '@/views/message/locale/en-US';
import localForgetPassword from '@/views/forgetPassword/locale/en-US';

import localeWorkplace from '@/views/dashboard/workplace/locale/en-US';

import localeMonitor from '@/views/dashboard/monitor/locale/en-US';

import localeSearchTable from '@/views/list/search-table/locale/en-US';
import localeCardList from '@/views/list/card/locale/en-US';

import localeStepForm from '@/views/form/step/locale/en-US';
import localeGroupForm from '@/views/form/group/locale/en-US';

import localeBasicProfile from '@/views/profile/basic/locale/en-US';

import localeSuccess from '@/views/result/success/locale/en-US';
import localeError from '@/views/result/error/locale/en-US';

import locale403 from '@/views/exception/403/locale/en-US';
import locale404 from '@/views/exception/404/locale/en-US';
import locale500 from '@/views/exception/500/locale/en-US';

import localeUserInfo from '@/views/user/info/locale/en-US';
import localeUserSetting from '@/views/user/setting/locale/en-US';

import localeSettings from './en-US/settings';
import localeKitOut from './en-US/kitout';

export default {
  'platform.title': 'Remote Assistance',
  'menu.message': 'Messages',
  'menu.address': 'Address Book',
  'menu.meeting': 'Meeting',
  'menu.record': 'Meeting Record',

  'menu.dashboard': 'Dashboard',
  'menu.server.dashboard': 'Dashboard-Server',
  'menu.server.workplace': 'Workplace-Server',
  'menu.server.monitor': 'Monitor-Server',
  'menu.list': 'List',

  'menu.result': 'Result',
  'menu.exception': 'Exception',
  'menu.form': 'Form',
  'menu.profile': 'Profile',
  'menu.visualization': 'Data Visualization',
  'menu.user': 'User Center',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': 'FAQ',
  'navbar.docs': 'Docs',
  'navbar.action.locale': 'Switch to English',
  'today': 'Today',
  'tomorrow': 'Tomorrow',
  'yesterday': 'Yesterday',
  'dateFormat': 'YYYY-MM-DD',
  'network.error': 'Network connection failure',
  'socket.status1': 'no connection',
  'socket.status2': 'connecting',
  'notification.assist.join.label1': 'Cancel',
  'notification.assist.join.label2': 'Rejoin',
  'notification.assist.join.hint': 'Hint',
  'notification.assist.join.title': 'You have an unfinished meeting',
  'notification.assist.join.title1': 'Do you want to rejoin?',
  'footer.label': 'Privacy policy',

  ...localeSettings,
  ...localeKitOut,
  ...localeMessageBox,
  ...localPassword,
  ...localForgetPassword,
  ...localeLogin,
  ...localeWorkplace,
  ...localArQrCode,

  ...localeMonitor,
  ...localeSearchTable,
  ...localeCardList,
  ...localeStepForm,
  ...localeGroupForm,
  ...localeBasicProfile,
  ...localeSuccess,
  ...localeError,
  ...locale403,
  ...locale404,
  ...locale500,
  ...localeUserInfo,
  ...localeUserSetting,

  ...localeMeeting,
  ...localeRecord,
  ...localAssist,
  ...localAddress,
  ...localMessage,
};
