export interface AddressInfo {
  selectPsn: any;
  limitMember: number;
  showLimitMember: number;
  memberList: any;
  memberGroupList: any;
}

export interface ContactsItem {
  alias?: string;
  avatarUrl?: string;
  name: string;
  userId: number;
}

export interface ContactsGroup {
  groupName: string;
  contacts?: ContactsItem[];
}
