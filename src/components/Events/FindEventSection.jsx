import { useState } from 'react';
import { fetchEvents } from '../../util/http';
import { useQuery } from '@tanstack/react-query';
import EventItem from './EventItem';

export default function FindEventSection() {
  const [searchTerm, setSearchTerm] = useState();

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['events', searchTerm],
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    enabled: searchTerm !== undefined,
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(event.target.elements[0].value);
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
          />
          <button>Search</button>
        </form>
      </header>
      {searchTerm === undefined && <p>Please enter a search term to find events.</p>}
      {isLoading && <p>Loading...</p>}
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
