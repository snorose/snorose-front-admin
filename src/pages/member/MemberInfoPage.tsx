import { useCallback, useState, useMemo } from 'react';
import { Button, Input } from '@/shared/components/ui';
import { PageHeader } from '@/shared/components';

import type { MemberInfo, EditMemberInfo } from '@/shared/types';
import {
  TabList,
  getMemberInfoTabs,
  MemberInfoView,
  MemberInfoEditForm,
} from '@/domains/MemberInfo';

import { searchUsersAPI, editUsersAPI } from '@/apis';
import { MEMBER_SAMPLE_DATA } from '@/__mocks__';
import { formatDateTime } from '@/domains/MemberInfo/utils/formatDateTime';

import { PencilIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/utils';

export default function MemberInfoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 상단 '학번' 카피
  const handleCopy = async (sourceId: string) => {
    await navigator.clipboard.writeText(String(sourceId));
    setCopiedId(sourceId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // 회원 검색 API
  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setSelectedMember(null);
      setErrorMessage('');
      toast.info('검색어를 입력해주세요.');
      return;
    }

    try {
      const data = await searchUsersAPI(query);

      if (data?.result) {
        setSelectedMember(data.result);
        setIsEdit(false);
        setErrorMessage('');
        return;
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '회원 검색에 실패했습니다.'));

      // 에러면 데이터 없으면 찾기 (미완성 api용 - 추후 삭제)
      const mock = MEMBER_SAMPLE_DATA.find(
        (dummy) =>
          dummy.loginId.toLowerCase() === query ||
          dummy.studentNumber.toLowerCase() === query
      );

      if (mock) {
        setSelectedMember(mock);
        setIsEdit(false);
        setErrorMessage('(MOCK) API 에러로 mock 데이터를 사용함.');
        return;
      }

      // 둘 다 없으면 null (미완성 api용 - 추후 삭제)
      setSelectedMember(null);
      setErrorMessage('사용자가 존재하지 않아요.');
    }

    setIsEdit(false);
  }, [searchQuery]);

  // 회원 정보 수정 가능 필드
  const EDIT_KEYS: (keyof EditMemberInfo)[] = [
    'userName',
    'studentNumber',
    'major',
    'userRoleId',
    'email',
    'birthday',
    'authenticatedAt',
  ];

  // 회원 정보 수정시 변경된 필드만 추출
  const createDiffPayload = (
    original: MemberInfo,
    updated: MemberInfo
  ): Partial<EditMemberInfo> => {
    const diff: Partial<EditMemberInfo> = {};

    EDIT_KEYS.forEach((key) => {
      const oldValue = original[key];
      const newValue = updated[key];

      if (oldValue === newValue) return;

      switch (key) {
        case 'userName':
        case 'email':
        case 'studentNumber':
        case 'major':
          if (typeof newValue === 'string') diff[key] = newValue;
          break;

        case 'birthday':
          if (newValue) diff[key] = String(newValue).substring(0, 10);
          break;

        case 'userRoleId':
          if (typeof newValue === 'number') diff[key] = newValue;
          break;

        case 'authenticatedAt': {
          if (newValue === null || newValue === '' || newValue === undefined) {
            diff[key] = null;
          } else if (typeof newValue === 'string') {
            diff[key] = formatDateTime(newValue);
          }
          break;
        }
      }
    });

    return diff;
  };

  const handleSaveEdit = async (updated: MemberInfo) => {
    if (!selectedMember) return;

    try {
      const diffPayload = createDiffPayload(selectedMember, updated);

      if (Object.keys(diffPayload).length === 0) {
        toast.info('변경 사항이 없습니다.');
        return;
      }

      await editUsersAPI(selectedMember.encryptedUserId, diffPayload);

      toast.success('회원 정보가 수정되었습니다.');

      setSelectedMember({ ...selectedMember, ...diffPayload });
      setIsEdit(false);
    } catch (error) {
      toast.error(getErrorMessage(error, '회원 정보 수정에 실패했습니다.'));
    }
  };

  const tabs = useMemo(() => {
    if (!selectedMember) return [];
    return getMemberInfoTabs(
      selectedMember.encryptedUserId,
      selectedMember.studentNumber
    );
  }, [selectedMember]);

  return (
    <div className='flex w-full flex-col gap-6'>
      <PageHeader
        title='회원 상세 조회'
        description='회원 정보를 조회할 수 있어요.'
      />

      <div className='flex gap-2'>
        <Input
          type='text'
          placeholder='아이디, 학번을 입력해주세요'
          className='w-96'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          size='sm'
          variant='outline'
          className='h-auto w-20 text-black'
          onClick={handleSearch}
        >
          검색
        </Button>
      </div>
      {errorMessage && <p className='font-medium'>{errorMessage}</p>}

      {selectedMember && (
        <>
          <div className='flex items-center gap-2'>
            <span className='text-2xl font-bold'>{selectedMember.loginId}</span>

            <span
              className={`cursor-pointer underline ${
                copiedId === selectedMember.studentNumber
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-blue-800'
              }`}
              onClick={() => handleCopy(selectedMember.studentNumber)}
            >
              ({selectedMember.studentNumber})
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <h3 className='text-lg font-bold'>회원정보</h3>
            <PencilIcon
              onClick={() => setIsEdit(true)}
              className='h-6 w-6 cursor-pointer rounded-sm bg-black p-1 text-white'
            />
          </div>

          {!isEdit ? (
            <MemberInfoView member={selectedMember} />
          ) : (
            <MemberInfoEditForm
              member={selectedMember}
              onSubmit={handleSaveEdit}
              onCancel={() => setIsEdit(false)}
            />
          )}

          <article className='rounded-md bg-blue-50 p-2'>
            <TabList defaultTab='point' tabs={tabs} />
          </article>
        </>
      )}
    </div>
  );
}
