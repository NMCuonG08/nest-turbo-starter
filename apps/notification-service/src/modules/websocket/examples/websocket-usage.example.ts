/**
 * EXAMPLES: Cách sử dụng WebSocket từ các services khác
 * 
 * File này chỉ là ví dụ, không được import trong production code
 */

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroserviceName, MS_INJECTION_TOKEN } from '@app/core';
import { Transport } from '@nestjs/microservices';

/**
 * Example 1: Service muốn emit event khi có action quan trọng
 */
@Injectable()
export class ExampleService {
  constructor(
    @Inject(MS_INJECTION_TOKEN(MicroserviceName.NotificationService, Transport.TCP))
    private readonly notificationClient: ClientProxy,
  ) {}

  /**
   * Example: Emit khi user tạo quiz
   */
  async createQuiz(userId: string, quizData: any) {
    // ... create quiz logic ...

    // Emit real-time notification
    this.notificationClient.emit('ws:emit:user', {
      userId,
      event: 'quiz:created',
      data: {
        quizId: quizData.id,
        title: quizData.title,
        message: 'Your quiz has been created successfully!',
      },
    });
  }

  /**
   * Example: Emit khi quiz được update
   */
  async updateQuiz(userId: string, quizId: string, updates: any) {
    // ... update logic ...

    // Notify quiz owner
    this.notificationClient.emit('ws:emit:user', {
      userId,
      event: 'quiz:updated',
      data: { quizId, updates },
    });

    // Notify all users watching this quiz (if using rooms)
    this.notificationClient.emit('ws:emit:room', {
      room: `quiz:${quizId}`,
      event: 'quiz:updated',
      data: { quizId, updates },
    });
  }

  /**
   * Example: Emit khi có nhiều người cần notify
   */
  async notifyTeamMembers(teamId: string, message: string) {
    const teamMemberIds = ['user1', 'user2', 'user3']; // Get from DB

    this.notificationClient.emit('ws:emit:users', {
      userIds: teamMemberIds,
      event: 'team:notification',
      data: {
        teamId,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Example: System-wide broadcast
   */
  async announceMaintenance(startTime: Date) {
    this.notificationClient.emit('ws:broadcast', {
      event: 'system:maintenance',
      data: {
        message: 'System will undergo maintenance',
        startTime: startTime.toISOString(),
        duration: '2 hours',
      },
    });
  }
}

/**
 * Example 2: Integration với existing service
 * 
 * File: apps/quiz-service/src/modules/quiz/quiz.service.ts
 * 
 * import { Inject } from '@nestjs/common';
 * import { ClientProxy, Transport } from '@nestjs/microservices';
 * import { MicroserviceName, MS_INJECTION_TOKEN } from '@app/core';
 * 
 * @Injectable()
 * export class QuizService {
 *   constructor(
 *     // ... other dependencies ...
 *     @Inject(MS_INJECTION_TOKEN(MicroserviceName.NotificationService, Transport.TCP))
 *     private readonly notificationClient: ClientProxy,
 *   ) {}
 * 
 *   async createQuiz(data: CreateQuizDataDto) {
 *     const quiz = await this.quizRepo.create(data);
 *     await this.quizRepo.save(quiz);
 * 
 *     // Emit WebSocket event
 *     this.notificationClient.emit('ws:emit:user', {
 *       userId: data.userId,
 *       event: 'quiz:created',
 *       data: {
 *         quizId: quiz.id,
 *         title: quiz.title,
 *       },
 *     });
 * 
 *     return quiz;
 *   }
 * }
 */

/**
 * Example 3: Client-side JavaScript/TypeScript
 * 
 * import { io } from 'socket.io-client';
 * 
 * // Connect với JWT token
 * const socket = io('http://localhost:3303', {
 *   auth: {
 *     token: localStorage.getItem('accessToken'),
 *   },
 * });
 * 
 * // Listen for events
 * socket.on('connect', () => {
 *   console.log('Connected to WebSocket');
 * });
 * 
 * socket.on('quiz:created', (data) => {
 *   console.log('Quiz created:', data);
 *   showNotification(`Quiz "${data.title}" has been created!`);
 * });
 * 
 * socket.on('quiz:updated', (data) => {
 *   console.log('Quiz updated:', data);
 *   refreshQuizList();
 * });
 * 
 * socket.on('system:maintenance', (data) => {
 *   showAlert(`Maintenance: ${data.message}`);
 * });
 * 
 * // Send ping to check connection
 * socket.emit('ping', {}, (response) => {
 *   console.log('Server responded:', response);
 * });
 */

