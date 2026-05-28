/**
 * Adapts Java backend DTOs → frontend types used by components.
 * This isolates components from backend naming conventions.
 */
import type { MovieDTO, TheatreDTO, ShowDTO, SeatDTO, BookingResponseDTO } from './api';
import type { Movie, Theatre, Show, Seat, BookingDetails } from './types';

export function adaptMovie(dto: MovieDTO): Movie {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    director: dto.director,
    duration: dto.durationMinutes,
    releaseDate: dto.releaseDate,
    certificate: dto.certificate,
    rating: dto.rating,
    votes: dto.votes,
    image: dto.posterUrl,
    banner: dto.bannerUrl,
    genre: dto.genres,
    language: dto.languages,
    format: dto.formats,
    cast: dto.cast.map((c) => ({ name: c.name, role: c.role, image: c.photoUrl })),
  };
}

export function adaptTheatreWithShows(
  theatreDto: TheatreDTO,
  showDtos: ShowDTO[]
): Theatre {
  return {
    id: theatreDto.id,
    name: theatreDto.name,
    location: theatreDto.address,
    distance: `${theatreDto.distanceKm.toFixed(1)} km`,
    amenities: theatreDto.amenities,
    shows: showDtos.map(adaptShow),
  };
}

export function adaptShow(dto: ShowDTO): Show {
  return {
    id: dto.id,
    time: dto.showTime,
    format: dto.format,
    language: dto.language,
    price: {
      silver: dto.silverPrice,
      gold: dto.goldPrice,
      platinum: dto.platinumPrice,
    },
    availableSeats: dto.availableSeats,
    totalSeats: dto.totalSeats,
  };
}

export function adaptSeat(dto: SeatDTO): Seat {
  const statusMap: Record<string, Seat['status']> = {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    BLOCKED: 'unavailable',
  };
  return {
    id: dto.seatLabel,
    row: dto.row,
    number: dto.seatNumber,
    category: dto.category.toLowerCase() as Seat['category'],
    status: statusMap[dto.status] ?? 'available',
    price: dto.price,
  };
}

export function adaptBookingResponse(dto: BookingResponseDTO): BookingDetails {
  return {
    movie: adaptMovie(dto.movie),
    theatre: adaptTheatreWithShows(dto.theatre, [dto.show]),
    show: adaptShow(dto.show),
    date: dto.show.showDate,
    seats: dto.seats.map(adaptSeat),
    totalAmount: dto.totalAmount,
    convenienceFee: dto.convenienceFee,
    bookingId: dto.bookingId,
  };
}
