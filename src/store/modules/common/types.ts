export interface CommonStore {
  networkStatus: boolean;
  socketStatus: number;
  lastLoginTime?: number;
  textInputMaxLength: number;
  companyInfo: any;
  platformConfig: any;
  btnLoading: boolean;
  notificationId: any;
}
