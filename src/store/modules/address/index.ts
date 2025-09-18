import { defineStore } from 'pinia';
import {
  getUserContacts as userContacts,
  getUserContactsGroup as userContactsGroup,
} from '@/api/address';

import { AddressInfo } from './types';

const useAddressStore = defineStore('address', {
  state: (): AddressInfo => ({
    selectPsn: [],
    limitMember: 17,
    showLimitMember: 15,
    memberList: [],
    memberGroupList: [],
  }),

  getters: {},

  actions: {
    updateAddressSelectPsn(selectPsn: any) {
      this.$patch({ selectPsn });
    },
    addMemberList(newMembers: any) {
      if (newMembers && newMembers.length > 0) {
        newMembers.forEach((member: any) => {
          const incomingMember = this.memberList.find(
            (m: any) => m.userId === member.userId
          );
          if (incomingMember) {
            member.pcOnline = incomingMember.pcOnline;
            member.androidOnline = incomingMember.androidOnline;
            member.glassOnline = incomingMember.glassOnline;
          }
        });
        newMembers.sort((a: any, b: any) => {
          const aOnline =
            a.pcOnline || a.androidOnline || a.glassOnline ? 1 : 0;
          const bOnline =
            b.pcOnline || b.androidOnline || b.glassOnline ? 1 : 0;
          return bOnline - aOnline;
        });
        this.$patch({ memberList: newMembers });
      }
    },
    addGroupMemberList(newGroupMemberList: any) {
      if (newGroupMemberList && newGroupMemberList.length > 0) {
        newGroupMemberList.forEach((group: any) => {
          group.contacts.forEach((member: any) => {
            this.memberGroupList.forEach((existingGroup: any) => {
              const incomingMember = existingGroup.contacts.find(
                (m: any) => m.userId === member.userId
              );
              if (incomingMember) {
                member.pcOnline = incomingMember.pcOnline;
                member.androidOnline = incomingMember.androidOnline;
                member.glassOnline = incomingMember.glassOnline;
              }
            });
          });
        });
        newGroupMemberList.forEach((group: any) => {
          group.contacts.sort((a: any, b: any) => {
            return (
              (b.pcOnline || b.androidOnline || b.glassOnline ? 1 : 0) -
              (a.pcOnline || a.androidOnline || a.glassOnline ? 1 : 0)
            );
          });
        });
        this.$patch({ memberGroupList: newGroupMemberList });
      }
    },
    updateMemberList(incomingMemberList: any) {
      this.memberList.forEach((existingMember: any) => {
        const incomingMember = incomingMemberList.find(
          (m: any) => m.userId === existingMember.userId
        );
        if (incomingMember) {
          incomingMember.pcOnline = existingMember.pcOnline;
          incomingMember.androidOnline = existingMember.androidOnline;
          incomingMember.glassOnline = existingMember.glassOnline;
        }
      });
      incomingMemberList.sort((a: any, b: any) => {
        const aOnline = a.pcOnline || a.androidOnline || a.glassOnline ? 1 : 0;
        const bOnline = b.pcOnline || b.androidOnline || b.glassOnline ? 1 : 0;
        return bOnline - aOnline;
      });
      this.$patch({ memberList: incomingMemberList });
    },
    updateMemberGroupList(incomingMemberGroupList: any) {
      this.memberGroupList.forEach((existingGroup: any) => {
        existingGroup.contacts.forEach((existingMember: any) => {
          incomingMemberGroupList.forEach((incomingGroup: any) => {
            const incomingMember = incomingGroup.contacts.find(
              (m: any) => m.userId === existingMember.userId
            );
            if (incomingMember) {
              incomingMember.pcOnline = existingMember.pcOnline;
              incomingMember.androidOnline = existingMember.androidOnline;
              incomingMember.glassOnline = existingMember.glassOnline;
            }
          });
        });
      });
      incomingMemberGroupList.forEach((group: any) => {
        group.contacts.sort((a: any, b: any) => {
          return (
            (b.pcOnline || b.androidOnline || b.glassOnline ? 1 : 0) -
            (a.pcOnline || a.androidOnline || a.glassOnline ? 1 : 0)
          );
        });
      });
      this.$patch({ memberGroupList: incomingMemberGroupList });
    },
    filterMembersNotInGroups(
      members: { userId: number; name: string }[],
      memberGroupList: {
        groupName: string;
        contacts: { userId: number; name: string }[];
      }[]
    ) {
      // Extract userIds from members into a Set for efficient lookup
      const memberUserIds = new Set<number>(
        members.map((member) => member.userId)
      );

      // Filter memberGroupList to remove contacts with userId present in memberUserIds
      const filteredMemberGroupList = memberGroupList.map((group) => {
        // Filter out contacts whose userId is in memberUserIds
        const filteredContacts = group.contacts.filter(
          (contact) => !memberUserIds.has(contact.userId)
        );

        // Return the group with updated contacts list
        return {
          ...group,
          contacts: filteredContacts,
        };
      });

      return filteredMemberGroupList;
    },
    filterMembersNotInList(members: any[], memberList: any[]) {
      console.log(members, memberList);
      // Extract userIds from memberList into a Set for efficient lookup
      const userIds = new Set<number>(members.map((member) => member.userId));
      // Filter members based on the userIds not present in memberListUserIds
      const filteredMembers = memberList.filter((member) => {
        const isNotInList = !userIds.has(member.userId);
        return isNotInList;
      });
      return filteredMembers;
    },
    updateMemberStatus(
      member: { client: number; userId: number },
      type: boolean
    ) {
      this.memberList.forEach((existingMember: any) => {
        if (existingMember.userId === member.userId) {
          if (type) {
            if (member.client === 3) {
              existingMember.pcOnline = true;
            } else if (member.client === 2) {
              existingMember.androidOnline = true;
            } else if (member.client === 4) {
              existingMember.glassOnline = true;
            }
          } else if (member.client === 3) {
            existingMember.pcOnline = false;
          } else if (member.client === 2) {
            existingMember.androidOnline = false;
          } else if (member.client === 4) {
            existingMember.glassOnline = false;
          }
        }
      });

      this.memberGroupList.forEach((group: any) => {
        group.contacts.forEach((existingMember: any) => {
          if (existingMember.userId === member.userId) {
            if (type) {
              if (member.client === 3) {
                existingMember.pcOnline = true;
              } else if (member.client === 2) {
                existingMember.androidOnline = true;
              } else if (member.client === 4) {
                existingMember.glassOnline = true;
              }
            } else if (member.client === 3) {
              existingMember.pcOnline = false;
            } else if (member.client === 2) {
              existingMember.androidOnline = false;
            } else if (member.client === 4) {
              existingMember.glassOnline = false;
            }
          }
        });
      });
      this.memberList.sort((a: any, b: any) => {
        return (
          (b.pcOnline || b.androidOnline || b.glassOnline ? 1 : 0) -
          (a.pcOnline || a.androidOnline || a.glassOnline ? 1 : 0)
        );
      });
      this.memberGroupList.forEach((group: any) => {
        group.contacts.sort((a: any, b: any) => {
          return (
            (b.pcOnline || b.androidOnline || b.glassOnline ? 1 : 0) -
            (a.pcOnline || a.androidOnline || a.glassOnline ? 1 : 0)
          );
        });
      });
      this.$patch({
        memberList: this.memberList,
        memberGroupList: this.memberGroupList,
      });
    },
    clearAddressSelectPsn(selectPsn: any = []) {
      this.$patch({ selectPsn });
    },
    getContactsData(params?: any) {
      return new Promise<void>((resolve, reject) => {
        userContacts(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getContactsGroupData(params?: any) {
      return new Promise<void>((resolve, reject) => {
        userContactsGroup(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    filterMemberListByUserIds(userIds?: number[]) {
      if (userIds && userIds.length > 0) {
        return this.memberList.filter((member: any) =>
          userIds.includes(member.userId)
        );
      }
      return this.memberList;
    },
    filterMemberInfoByUserId(userId?: number) {
      if (userId) {
        const member = this.memberList.find((m: any) => userId === m.userId);
        return member;
      }
      return null;
    },
  },
});

export default useAddressStore;
