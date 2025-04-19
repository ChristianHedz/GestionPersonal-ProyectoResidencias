import { Component, ElementRef, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ChatMessage, ChatbotService } from '../../services/chatbot.service';
import { finalize } from 'rxjs';

/**
 * Componente que muestra una burbuja de chatbot flotante que se expande al hacer clic
 * Permite interacción por texto y voz usando la API de OpenAI
 */
@Component({
  selector: 'app-chatbot-bubble',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './chatbot-bubble.component.html',
  styleUrls: ['./chatbot-bubble.component.css']
})
export class ChatbotBubbleComponent {
  // Servicios
  private readonly chatbotService = inject(ChatbotService);
  private readonly snackBar = inject(MatSnackBar);

  // Referencias del DOM
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;
  @ViewChild('inputMessage') inputMessage!: ElementRef<HTMLInputElement>;

  // Señales para el estado del componente
  protected readonly isOpen = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isRecording = signal(false);
  protected readonly currentMessage = signal('');
  protected readonly messages = signal<ChatMessage[]>([
    {
      content: '¡Hola! ¿En qué puedo ayudarte hoy? Puedes escribir tu consulta o usar el micrófono para hablar.',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  protected readonly audioMode = signal(false);
  
  // Propiedades para la grabación de audio
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  protected readonly recordingTime = signal(0);
  private recordingInterval: any;

  // Propiedad computada para saber si hay un mensaje para enviar
  protected readonly canSendMessage = computed(() => 
    this.currentMessage().trim().length > 0 && !this.isLoading()
  );

  /**
   * Alterna el estado del chatbot entre abierto y cerrado
   */
  toggleChat(): void {
    this.isOpen.update(state => !state);
    
    // Si se cierra el chat mientras está grabando, detener la grabación
    if (!this.isOpen() && this.isRecording()) {
      this.stopRecording();
    }
  }

  /**
   * Envía un mensaje de texto al chatbot
   */
  sendMessage(): void {
    if (!this.canSendMessage()) return;
    
    const userMessage = this.currentMessage().trim();
    if (!userMessage) return;
    
    // Agregar mensaje del usuario a la conversación
    this.messages.update(prev => [
      ...prev,
      {
        content: userMessage,
        role: 'user',
        timestamp: new Date()
      }
    ]);
    
    // Limpiar el campo de entrada
    this.currentMessage.set('');
    
    // Mostrar indicador de carga
    this.isLoading.set(true);
    
    // Enviar mensaje al servicio y procesar respuesta
    this.chatbotService.sendTextMessage(userMessage)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          // Agregar respuesta del asistente
          this.messages.update(prev => [
            ...prev,
            {
              content: response.question,
              role: 'assistant',
              timestamp: new Date()
            }
          ]);
          
          // Scrollear al final del chat
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          console.error('Error al enviar mensaje:', error);
          this.showError('Ocurrió un error al procesar tu mensaje. Inténtalo de nuevo.');
        }
      });
  }

  /**
   * Alterna entre el modo de texto y audio
   */
  toggleAudioMode(): void {
    this.audioMode.update(mode => !mode);
  }

  /**
   * Inicia la grabación de audio
   */
  startRecording(): void {
    if (this.isRecording()) return;
    
    // Solicitar acceso al micrófono
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.isRecording.set(true);
        this.audioChunks = [];
        
        // Configurar el MediaRecorder
        this.mediaRecorder = new MediaRecorder(stream);
        
        // Configurar la captura de datos
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        
        // Configurar el final de la grabación
        this.mediaRecorder.onstop = () => {
          // Detener todas las pistas de audio
          stream.getTracks().forEach(track => track.stop());
          
          // Procesar el audio grabado
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.sendAudioMessage(audioBlob);
        };
        
        // Iniciar la grabación
        this.mediaRecorder.start();
        
        // Iniciar temporizador
        let seconds = 0;
        this.recordingTime.set(0);
        this.recordingInterval = setInterval(() => {
          seconds++;
          this.recordingTime.set(seconds);
          
          // Limitar grabación a 60 segundos
          if (seconds >= 60) {
            this.stopRecording();
          }
        }, 1000);
      })
      .catch(error => {
        console.error('Error accediendo al micrófono:', error);
        this.showError('No se pudo acceder al micrófono. Verifica los permisos.');
      });
  }

  /**
   * Detiene la grabación de audio
   */
  stopRecording(): void {
    if (!this.isRecording() || !this.mediaRecorder) return;
    
    // Detener grabación y temporizador
    this.mediaRecorder.stop();
    clearInterval(this.recordingInterval);
    this.isRecording.set(false);
    this.recordingTime.set(0);
  }

  /**
   * Envía un mensaje de audio al chatbot
   */
  private sendAudioMessage(audioBlob: Blob): void {
    // Agregar mensaje del usuario a la conversación
    this.messages.update(prev => [
      ...prev,
      {
        content: '🎤 Mensaje de voz enviado',
        role: 'user',
        timestamp: new Date()
      }
    ]);
    
    // Mostrar indicador de carga
    this.isLoading.set(true);
    
    // Enviar audio al servicio
    this.chatbotService.sendAudioMessage(audioBlob)
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (audioResponse) => {
          // Agregar respuesta del asistente
          this.messages.update(prev => [
            ...prev,
            {
              content: '🔊 Respuesta de voz (reproduciendo...)',
              role: 'assistant',
              timestamp: new Date()
            }
          ]);
          
          // Reproducir el audio
          this.playAudioResponse(audioResponse);
          
          // Scrollear al final del chat
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error) => {
          console.error('Error al enviar audio:', error);
          this.showError('Ocurrió un error al procesar tu mensaje de voz. Inténtalo de nuevo.');
        }
      });
  }

  /**
   * Reproduce la respuesta de audio recibida
   */
  private playAudioResponse(audioBlob: Blob): void {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = this.audioElement.nativeElement;
    
    audio.src = audioUrl;
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.play().catch(error => {
      console.error('Error reproduciendo audio:', error);
      this.showError('No se pudo reproducir la respuesta de audio.');
    });
  }

  /**
   * Hace scroll hasta el final del chat
   */
  private scrollToBottom(): void {
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
      chatContent.scrollTop = chatContent.scrollHeight;
    }
  }

  /**
   * Muestra un mensaje de error
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: 'error-snackbar'
    });
  }

  /**
   * Formatea el tiempo de grabación como MM:SS
   */
  formatRecordingTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
