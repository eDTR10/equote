import axios from 'axios';
import { Entity } from '../types/entity';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Configure axios with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': 'Token 650eda9ad3e37608685dab00e603fa22d179abab',
    'Content-Type': 'application/json'
  }
});

export const fetchEntities = async (): Promise<Entity[]> => {
  try {
    const response = await apiClient.get('/quotation/entities/');
    return response.data;
  } catch (error) {
    console.error('Error fetching entities:', error);
    throw error;
  }
};

export const fetchEntityById = async (id: number): Promise<Entity> => {
  try {
    const response = await apiClient.get(`/quotation/entities/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching entity with id ${id}:`, error);
    throw error;
  }
};

export const createEntity = async (entityData: Partial<Entity>): Promise<Entity> => {
  try {
    const response = await apiClient.post('/quotation/entities/', entityData);
    return response.data;
  } catch (error) {
    console.error('Error creating entity:', error);
    throw error;
  }
};

export const updateEntity = async (id: number, entityData: Partial<Entity>): Promise<Entity> => {
  try {
    const response = await apiClient.put(`/quotation/entities/${id}/`, entityData);
    return response.data;
  } catch (error) {
    console.error(`Error updating entity with id ${id}:`, error);
    throw error;
  }
};

export const deleteEntity = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/quotation/entities/${id}/`);
  } catch (error) {
    console.error(`Error deleting entity with id ${id}:`, error);
    throw error;
  }
};