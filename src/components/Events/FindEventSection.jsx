import { useState } from 'react';
import { fetchEvents } from '../../util/http';
import { useQuery } from '@tanstack/react-query';

export default function FindEventSection() {
  const [searchTerm, setSearchTerm] = useState('');

  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', searchTerm],
    queryFn: () => fetchEvents({ searchTerm }),
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
      <p>Please enter a search term and to find events.</p>
      {isPending && <p>Loading...</p>}
    </section>
  );
}
