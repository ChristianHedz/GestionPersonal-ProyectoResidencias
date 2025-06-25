import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/enviroments';

export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  question: string;
}

export interface ChatbotDocument {
  id: string;
  filename: string;
  fileSize: number;
  uploadDate: Date;
  status: 'processed' | 'processing' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.urlApi;

  /**
   * Envía un mensaje de texto al chatbot y recibe una respuesta en texto
   * @param message Mensaje del usuario
   * @returns Observable con la respuesta del chatbot
   */
  sendTextMessage(message: string): Observable<ChatResponse> {
    const request: ChatRequest = { question: message };
    return this.http.post<ChatResponse>(`${this.API_URL}/chat`, request);
  }

  /**
   * Envía un archivo de audio al chatbot y recibe una respuesta en audio
   * @param audioBlob Archivo de audio grabado
   * @returns Observable con la respuesta en audio como blob
   */
  sendAudioMessage(audioBlob: Blob): Observable<Blob> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    return this.http.post(`${this.API_URL}/chat/audio`, formData, {
      responseType: 'blob'
    });
  }
  
  /**
   * Sube un documento al sistema para ser procesado por el chatbot
   * @param file Archivo a subir
   * @param description Descripción opcional del documento
   * @returns Observable con información del documento subido
   */
  uploadDocument(file: File, description?: string): Observable<ChatbotDocument> {
    const formData = new FormData();
    formData.append('document', file);
    
    if (description) {
      formData.append('description', description);
    }
    
    return this.http.post<ChatbotDocument>(`${this.API_URL}/chat/documents/upload`, formData);
  }

  /**
   * Obtiene la lista de documentos subidos al chatbot
   * @returns Observable con el listado de documentos
   */
  getDocuments(): Observable<ChatbotDocument[]> {
    return this.http.get<ChatbotDocument[]>(`${this.API_URL}/chat/documents`);
  }

  /**
   * Elimina un documento del chatbot
   * @param documentId Identificador del documento a eliminar
   * @returns Observable con la respuesta del servidor
   */
  deleteDocument(documentId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/chat/documents/${documentId}`);
  }
}
