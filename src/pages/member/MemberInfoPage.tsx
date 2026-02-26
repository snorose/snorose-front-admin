import { useCallback, useState } from 'react';

import { Copy, PencilIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/shared/components';
import { Button, Input } from '@/shared/components/ui';
import type { EditMemberInfo, MemberInfo } from '@/shared/types';
import { getErrorMessage } from '@/shared/utils';

import { MemberInfoEditForm, MemberInfoView } from '@/domains/MemberInfo';
import { formatDateTime } from '@/domains/MemberInfo/utils/formatDateTime';

import { MEMBER_SAMPLE_DATA } from '@/__mocks__';
import { editUsersAPI, searchUsersAPI } from '@/apis';

export default function MemberInfoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 상단 '학번' 카피
  const handleCopy = async (sourceId: string) => {
    await navigator.clipboard.writeText(String(sourceId));
    toast.success('복사되었습니다.');
  };

  // 회원 검색 API
  const handleSearch = useCallback(async () => {
    const query = searchQuery.trim().toLowerCase();
    const findMockMember = () =>
      MEMBER_SAMPLE_DATA.find(
        (dummy) =>
          dummy.loginId.toLowerCase() === query ||
          dummy.studentNumber.toLowerCase() === query
      );

    if (!query) {
      setSelectedMember(null);
      setHasSearched(false);
      setErrorMessage('');
      toast.info('검색어를 입력해주세요.');
      return;
    }

    try {
      setHasSearched(true);
      const data = await searchUsersAPI(query);
      const result = data?.result;
      const resultMember = Array.isArray(result)
        ? (result[0] as MemberInfo | undefined)
        : (result as MemberInfo | null);

      if (resultMember) {
        setSelectedMember(resultMember);
        setIsEdit(false);
        setErrorMessage('');
        return;
      }

      const mock = findMockMember();
      if (mock) {
        setSelectedMember(mock);
        setIsEdit(false);
        setErrorMessage('(MOCK) API 미완성으로 mock 데이터를 사용함.');
        return;
      }

      setSelectedMember(null);
      setErrorMessage('사용자가 존재하지 않아요.');
      setIsEdit(false);
      return;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, '회원 검색에 실패했습니다.'));

      // 에러면 데이터 없으면 찾기 (미완성 api용 - 추후 삭제)
      const mock = findMockMember();

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

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setSelectedMember(null);
    setHasSearched(false);
    setIsEdit(false);
    setErrorMessage('');
  }, []);

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

  // const tabs = useMemo(() => {
  //   if (!selectedMember) return [];
  //   return getMemberInfoTabs(
  //     selectedMember.encryptedUserId,
  //     selectedMember.studentNumber
  //   );
  // }, [selectedMember]);

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
          className='h-auto w-15 text-black'
          onClick={handleSearch}
        >
          검색
        </Button>
        <Button
          size='sm'
          variant='outline'
          className='h-auto w-15 bg-gray-200 text-black hover:bg-gray-500 hover:text-white'
          onClick={handleReset}
        >
          초기화
        </Button>
      </div>
      {errorMessage && <p className='font-medium'>{errorMessage}</p>}

      <div className='relative flex items-center gap-2'>
        <span className='text-2xl font-bold'>
          {selectedMember?.userName ?? '회원 미선택'}
        </span>

        <div className='relative'>
          <span className='pr-6'>
            ({selectedMember?.studentNumber ?? '회원을 검색해 주세요.'})
          </span>

          {selectedMember?.studentNumber && (
            <button
              type='button'
              onClick={() => handleCopy(selectedMember.studentNumber)}
              aria-label='복사'
              className='absolute top-1/2 right-0 -translate-y-1/2 rounded p-1 text-gray-600 hover:bg-gray-100'
            >
              <Copy className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <h3 className='text-lg font-bold'>회원정보</h3>
        {selectedMember && (
          <PencilIcon
            onClick={() => setIsEdit(true)}
            className='h-6 w-6 cursor-pointer rounded-sm bg-black p-1 text-white'
          />
        )}
      </div>

      {!isEdit || !selectedMember ? (
        <MemberInfoView
          member={selectedMember}
          showSearchPlaceholder={!hasSearched}
        />
      ) : (
        <MemberInfoEditForm
          member={selectedMember}
          onSubmit={handleSaveEdit}
          onCancel={() => setIsEdit(false)}
        />
      )}

      {/* <article className='rounded-md bg-blue-50 p-2'>
        <TabList defaultTab='point' tabs={tabs} />
      </article> */}
    </div>
  );
}
