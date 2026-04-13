import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EventDetails() {
  const navigate = useNavigate();
  const params = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['event', params.id],
    queryFn: ({signal}) => fetchEvent({ signal, id: params.id }),
  });

  const { mutate, isPending: isDeleting, isError: isDeleteError, error: deleteError } = useMutation({
    mutationFn: () => deleteEvent({ id: params.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['events'], 
        refetchType: 'none'
      });
      navigate(`/events`);
    },
  });

  const handleDelete = () => {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = (
      <div id='event-details-content' className='center'>
        <p>Fetching event data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id='event-details-content' className='center'>
        <ErrorBlock 
          title="Failed to load event" 
          message={
            error.info?.message || 
            'Failed to fetch event data, please try again later.'} 
        />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            {isDeleteError && <p>Error deleting event: {deleteError.message}</p>}
            <button onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img
            src={`http://localhost:3000/${data.image}`}
            alt={data.title}
          />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`${data.date}T${data.time}`}>{formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
