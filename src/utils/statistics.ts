export interface Room {
  status: "EMPTY" | "RENTED";
  price: number;
}

export function getRoomStatistics(rooms: Room[]) {
  const total = rooms.length;
  const emptyRooms = rooms.filter(r => r.status === "EMPTY").length;
  const rentedRooms = rooms.filter(r => r.status === "RENTED").length;

  const totalRevenue = rooms
    .filter(r => r.status === "RENTED")
    .reduce((sum, r) => sum + r.price, 0);

  return {
    total,
    emptyRooms,
    rentedRooms,
    totalRevenue
  };
}
