import { useEffect, useState } from 'react';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../../util/http.js';
import { useQuery } from '@tanstack/react-query';

export default function NewEventsSection() {

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
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
