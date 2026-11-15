import { Property, User, Booking, Fee } from './api';
import { Property as MockProperty, User as MockUser, Booking as MockBooking, Fee as MockFee } from '../data/mockData';

export const transformProperty = (apiProperty: Property): MockProperty => ({
  id: apiProperty.id.toString(),
  name: apiProperty.name,
  resort: apiProperty.resort,
  location: apiProperty.location,
  province: apiProperty.province,
  description: apiProperty.description,
  price: apiProperty.price,
  bedrooms: apiProperty.bedrooms,
  bathrooms: apiProperty.bathrooms,
  area: apiProperty.area,
  type: apiProperty.type.toLowerCase() as MockProperty['type'],
  status: apiProperty.status.toLowerCase() as MockProperty['status'],
  transactionType: (apiProperty.transactionType || 'RENT').toLowerCase() as MockProperty['transactionType'],
  amenities: apiProperty.amenities.split(','),
  images: apiProperty.images.split(','),
  rating: apiProperty.rating,
  reviews: apiProperty.reviews,
  floorLevel: apiProperty.floorLevel,
  featured: apiProperty.featured,
});

export const transformUser = (apiUser: User): MockUser => ({
  id: apiUser.id.toString(),
  name: apiUser.name,
  email: apiUser.email,
  phone: apiUser.phone,
  cmnd: apiUser.cmnd,
  address: apiUser.address || '',
  role: apiUser.role.toLowerCase() as MockUser['role'],
  status: apiUser.status.toLowerCase() as MockUser['status'],
  joinDate: apiUser.joinDate?.split('T')[0] || '',
  lastLogin: apiUser.lastLogin ? apiUser.lastLogin.split('T')[0] : '',
  avatar: apiUser.avatar || `https://ui-avatars.com/api/?background=0D1F35&color=C9A96E&name=${encodeURIComponent(apiUser.name)}`,
  totalBookings: apiUser.totalBookings || 0,
  totalSpent: apiUser.totalSpent || 0,
});

export const transformBooking = (apiBooking: Booking): MockBooking => ({
  id: apiBooking.id.toString(),
  userId: apiBooking.userId.toString(),
  propertyId: apiBooking.propertyId.toString(),
  propertyName: apiBooking.propertyName,
  resort: apiBooking.resort,
  userName: apiBooking.userName,
  userEmail: apiBooking.userEmail,
  userPhone: apiBooking.userPhone,
  startDate: apiBooking.startDate.split('T')[0],
  endDate: apiBooking.endDate.split('T')[0],
  months: apiBooking.months,
  basePrice: apiBooking.basePrice,
  processingFee: apiBooking.processingFee,
  deposit: apiBooking.deposit,
  totalPrice: apiBooking.totalPrice,
  status: apiBooking.status.toLowerCase() as MockBooking['status'],
  paymentStatus: apiBooking.paymentStatus.toLowerCase() as MockBooking['paymentStatus'],
  paymentMethod: apiBooking.paymentMethod || '',
  createdAt: apiBooking.createdAt.split('T')[0],
  notes: apiBooking.notes,
});

export const transformFee = (apiFee: Fee): MockFee => ({
  id: apiFee.id.toString(),
  name: apiFee.name,
  type: apiFee.type.toLowerCase() as MockFee['type'],
  amount: apiFee.amount,
  enabled: apiFee.enabled,
  description: apiFee.description,
  appliesTo: apiFee.appliesTo,
});

export const transformProperties = (apiProperties: Property[]): MockProperty[] => 
  apiProperties.map(transformProperty);

export const transformUsers = (apiUsers: User[]): MockUser[] => 
  apiUsers.map(transformUser);

export const transformBookings = (apiBookings: Booking[]): MockBooking[] => 
  apiBookings.map(transformBooking);

export const transformFees = (apiFees: Fee[]): MockFee[] => 
  apiFees.map(transformFee);