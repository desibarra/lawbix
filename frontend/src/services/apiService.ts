import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<any> {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  }

  async register(data: any): Promise<any> {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  // Company endpoints
  async getCompany(): Promise<any> {
    const response = await this.api.get('/companies');
    return response.data;
  }

  async updateCompany(id: number, data: any): Promise<any> {
    const response = await this.api.put(`/companies/${id}`, data);
    return response.data;
  }

  // Documents endpoints
  async getDocuments(): Promise<any> {
    const response = await this.api.get('/documents');
    return response.data;
  }

  async generateDocument(type: string, data: any): Promise<any> {
    const response = await this.api.post('/documents/generate', { type, ...data });
    return response.data;
  }

  async downloadDocument(id: number): Promise<Blob> {
    const response = await this.api.get(`/documents/download/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getDocumentTemplates(): Promise<any> {
    const response = await this.api.get('/documents/templates');
    return response.data;
  }

  // Diagnosis endpoints
  async getDiagnosisResults(): Promise<any> {
    const response = await this.api.get('/diagnosis/results');
    return response.data;
  }

  async getDiagnosisQuestions(): Promise<any> {
    const response = await this.api.get('/diagnosis/questions');
    return response.data;
  }

  async submitDiagnosis(answers: any): Promise<any> {
    const response = await this.api.post('/diagnosis/submit', answers);
    return response.data;
  }

  // Roadmap endpoints
  async getRoadmap(): Promise<any> {
    const response = await this.api.get('/roadmap');
    return response.data;
  }

  async createRoadmapItem(data: any): Promise<any> {
    const response = await this.api.post('/roadmap', data);
    return response.data;
  }

  async updateRoadmapItem(id: number, data: any): Promise<any> {
    const response = await this.api.put(`/roadmap/${id}`, data);
    return response.data;
  }

  async deleteRoadmapItem(id: number): Promise<any> {
    const response = await this.api.delete(`/roadmap/${id}`);
    return response.data;
  }

  // Risks endpoints
  async getRisks(): Promise<any> {
    const response = await this.api.get('/risks');
    return response.data;
  }

  async createRisk(data: any): Promise<any> {
    const response = await this.api.post('/risks', data);
    return response.data;
  }

  async updateRisk(id: number, data: any): Promise<any> {
    const response = await this.api.put(`/risks/${id}`, data);
    return response.data;
  }

  async deleteRisk(id: number): Promise<any> {
    const response = await this.api.delete(`/risks/${id}`);
    return response.data;
  }

  // Chatbot endpoint
  async sendChatMessage(message: string, conversationId?: number): Promise<any> {
    const response = await this.api.post('/chatbot', { message, conversationId });
    return response.data;
  }

  // Generic methods for flexibility
  async get(endpoint: string): Promise<any> {
    const response = await this.api.get(endpoint);
    return response.data;
  }

  async post(endpoint: string, data?: any): Promise<any> {
    const response = await this.api.post(endpoint, data);
    return response.data;
  }

  async put(endpoint: string, data?: any): Promise<any> {
    const response = await this.api.put(endpoint, data);
    return response.data;
  }

  async delete(endpoint: string): Promise<any> {
    const response = await this.api.delete(endpoint);
    return response.data;
  }
}

export default new ApiService();
