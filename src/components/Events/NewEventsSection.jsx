import { useEffect, useState } from 'react';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../../util/http.js';
import { useQuery } from '@tanstack/react-query';

export default function NewEventsSection() {

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', { max: 3 }], // 쿼리 키는 고유해야 하며, 쿼리 함수에 전달된 매개변수를 포함해야 함. (이 경우, max: 3)
    queryFn: ({signal, queryKey}) => fetchEvents({ signal, ...queryKey[1] }), // queryKey는 배열이므로, 매개변수 객체는 queryKey의 두 번째 요소 (index 1)에 있음
    staleTime: 5000, // 데이터가 "신선"한 상태로 간주되는 시간 (ms 단위, 기본값: 0)
    // gcTime: 1000,  // 캐시된 데이터가 메모리에서 제거되기까지의 시간 (ms 단위, 기본값: 5분)
  });

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {isPending && <LoadingIndicator />}
      {isError && <ErrorBlock title="An error occurred" message={error.message} />}
      {data && (
        <ul className="events-list">
          {data.map((event) => (
            <li key={event.id}>
              <EventItem event={event} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
