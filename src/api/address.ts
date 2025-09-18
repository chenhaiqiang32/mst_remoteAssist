import axios from 'axios';
import { ContactsItem, ContactsGroup } from '@/store/modules/address/types';

export function getUserContacts(params: any) {
  return axios.get<Array<ContactsItem>>('/api/chat/user/contacts', { params });
}

export function getUserContactsGroup(params: any) {
  return axios.get<ContactsGroup>('/api/chat/user/contacts/group', { params });
}
