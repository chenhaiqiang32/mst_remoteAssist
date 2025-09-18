import localeMessageBox from '@/components/message-box/locale/zh-CN';

import localPassword from '@/components/password/locale/zh-CN';

import localArQrCode from '@/components/ar-qr-code/locale/zh-CN';
import localAssist from '@/components/meeting/locale/zh-CN';

import localeLogin from '@/views/login/locale/zh-CN';

import localeMeeting from '@/views/meeting/locale/zh-CN';
import localeRecord from '@/views/record/locale/zh-CN';

import localAddress from '@/views/address/locale/zh-CN';
import localMessage from '@/views/message/locale/zh-CN';

import localForgetPassword from '@/views/forgetPassword/locale/zh-CN';

import localeWorkplace from '@/views/dashboard/workplace/locale/zh-CN';

import localeMonitor from '@/views/dashboard/monitor/locale/zh-CN';

import localeSearchTable from '@/views/list/search-table/locale/zh-CN';
import localeCardList from '@/views/list/card/locale/zh-CN';

import localeStepForm from '@/views/form/step/locale/zh-CN';
import localeGroupForm from '@/views/form/group/locale/zh-CN';

import localeBasicProfile from '@/views/profile/basic/locale/zh-CN';

import localeSuccess from '@/views/result/success/locale/zh-CN';
import localeError from '@/views/result/error/locale/zh-CN';

import locale403 from '@/views/exception/403/locale/zh-CN';
import locale404 from '@/views/exception/404/locale/zh-CN';
import locale500 from '@/views/exception/500/locale/zh-CN';

import localeUserInfo from '@/views/user/info/locale/zh-CN';
import localeUserSetting from '@/views/user/setting/locale/zh-CN';

import localeSettings from './zh-CN/settings';
import localeKitOut from './zh-CN/kitout';

export default {
  'platform.title': '远程协助',
  'menu.message': '消息',
  'menu.address': '通讯录',
  'menu.meeting': '会议',
  'menu.record': '会议记录',

  'menu.dashboard': '仪表盘',
  'menu.server.dashboard': '仪表盘-服务端',
  'menu.server.workplace': '工作台-服务端',
  'menu.server.monitor': '实时监控-服务端',
  'menu.list': '列表页',
  'menu.result': '结果页',
  'menu.exception': '异常页',
  'menu.form': '表单页',
  'menu.profile': '详情页',
  'menu.visualization': '数据可视化',
  'menu.user': '个人中心',
  'menu.arcoWebsite': 'Arco Design',
  'menu.faq': '常见问题',
  'navbar.docs': '文档中心',
  'navbar.action.locale': '切换为中文',
  'today': '今天',
  'tomorrow': '明天',
  'yesterday': '昨天',
  'dateFormat': 'YYYY年MM月DD日',
  'network.error': '网络连接失败',
  'socket.status1': '未连接',
  'socket.status2': '连接中',
  'notification.assist.join.label1': '取消',
  'notification.assist.join.label2': '重新加入',
  'notification.assist.join.hint': '提示',
  'notification.assist.join.title': '您有未完成的会议',
  'notification.assist.join.title1': '是否要重新加入?',
  'footer.label': '隐私条款',
  ...localeSettings,
  ...localeKitOut,
  ...localeMessageBox,
  ...localPassword,
  ...localeLogin,
  ...localeWorkplace,
  ...localForgetPassword,
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
