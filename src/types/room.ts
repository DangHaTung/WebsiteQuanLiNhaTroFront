export interface Room {
  id: number;
  title: string;
  price: number;
  address: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  isNew?: boolean;
  isHot?: boolean;
}
