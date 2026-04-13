import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['event', params.id],
    queryFn: ({signal}) => fetchEvent({ signal, id: params.id }),
  })

  const { mutate, isPending: isPendingUpdate, isError: isErrorUpdating, error: updateError } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event; // 이미 캐싱되어 있는 데이터 (mutate 함수에 전달된 데이터)

      // 낙관적 업데이트: 서버 응답을 기다리지 않고 바로 UI 업데이트
      // ★ 주의할점. cancelQueries로 특정 키의 모든 활성 쿼리를 먼저 취소해야 함. ★
      // 그렇지 않으면, 해당 키에 대한 활성 쿼리가 있다면, mutate 함수에 전달된 데이터로 업데이트하기 전에 서버에서 데이터를 가져오는 쿼리가 먼저 실행될 수 있음. (이 경우, 낙관적 업데이트가 무의미해짐)
      // 이때, cancleQueries는 promise를 반환하므로 await로 처리해야 됨. 그럼 함수에도 async 키워드가 필요함.
      await queryClient.cancelQueries({queryKey: ['events', params.id]});

      // 이전 데이터 저장 (롤백용)
      const previousEvent = queryClient.getQueryData(['event', params.id]);
      const previousEvents = queryClient.getQueryData(['events']);

      // 개별 상세 페이지 업데이트
      queryClient.setQueryData(
        ['event', params.id],
        newEvent,
      );

      // 목록에서도 해당 이벤트 업데이트 (있으면)
      const events = queryClient.getQueryData(['events']);
      if (events) {
        queryClient.setQueryData(
          ['events'],
          events.map(e => e.id === params.id ? newEvent : e)
        );
      }

      return { previousEvent, previousEvents };
    },

    // error: 실패하게 되는 error 객체 수신
    // data: mutate 함수에 전달된 데이터
    // context: onMutate에서 반환된 객체 (이 경우, previousEvent)
    onError: (error, data, context) => {
      queryClient.setQueryData(
        ['event', params.id],
        context.previousEvent,
      );
      if (context.previousEvents) {
        queryClient.setQueryData(['events'], context.previousEvents);
      }
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData }); // 여기서 이미 react-query의 캐시가 업데이트됨
    navigate('../');
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {
    content = (
      <div className='center'>
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = <>
      <ErrorBlock 
        title="Failed to load event" 
        message={
          error.info?.message || 
          'Failed to load event data. Please check your inputs and try again later.'} 
      />
      <div className='form-actions'>
        <Link to="../" className="button">
          Okay
        </Link>
      </div>
    </>
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    )
  }

  return (
    <Modal onClose={handleClose}>{content}</Modal>
  );
}
