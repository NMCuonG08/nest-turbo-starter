# WebSocket Module

Shared WebSocket service để các microservices có thể emit real-time events đến clients.

## Kiến trúc

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Auth     │     │ User     │     │ Quiz     │
│ Service  │     │ Service  │     │ Service  │
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │               │               │
     │ TCP/Kafka     │ TCP/Kafka     │ TCP/Kafka
     ▼               ▼               ▼
┌─────────────────────────────────────────┐
│    Notification Service                 │
│    WebSocket Consumer                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    WebSocket Gateway                    │
│    (Redis Adapter for scaling)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ Client 1 │ │ Client 2 │ │ Client 3 │
└──────────┘ └──────────┘ └──────────┘
```

## Authentication

Clients cần cung cấp JWT token khi connect:

```javascript
// Client side (JavaScript)
const socket = io('ws://localhost:3303', {
  auth: {
    token: 'your-jwt-token'
  },
  // hoặc
  query: {
    token: 'your-jwt-token'
  }
});
```

## Cách các service khác emit events

### 1. Qua TCP Microservice (Recommended)

```typescript
// Trong bất kỳ service nào (auth-service, user-service, quiz-service, etc.)
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroserviceName, MS_INJECTION_TOKEN } from '@app/core';
import { Transport } from '@nestjs/microservices';

@Injectable()
export class SomeService {
  constructor(
    @Inject(MS_INJECTION_TOKEN(MicroserviceName.NotificationService, Transport.TCP))
    private readonly notificationClient: ClientProxy,
  ) {}

  async someAction(userId: string) {
    // ... business logic ...
    
    // Emit event qua WebSocket
    this.notificationClient.emit('ws:emit:user', {
      userId,
      event: 'action:completed',
      data: { message: 'Action completed successfully' },
    });
  }
}
```

### 2. Ví dụ: Quiz Service emit khi quiz được tạo

```typescript
// apps/quiz-service/src/modules/quiz/quiz.service.ts
async createQuiz(data: CreateQuizDataDto) {
  // ... create quiz logic ...
  
  // Emit event qua WebSocket
  this.notificationClient.emit('ws:emit:user', {
    userId: data.userId,
    event: 'quiz:created',
    data: {
      quizId: quiz.id,
      title: quiz.title,
      createdAt: quiz.createdAt,
    },
  });
  
  return quiz;
}
```

### 3. Broadcast đến tất cả users

```typescript
// Broadcast system notification
this.notificationClient.emit('ws:broadcast', {
  event: 'system:maintenance',
  data: {
    message: 'System will be under maintenance in 10 minutes',
    scheduledAt: '2024-01-01T12:00:00Z',
  },
});
```

### 4. Emit đến nhiều users

```typescript
// Notify multiple users
this.notificationClient.emit('ws:emit:users', {
  userIds: ['user1', 'user2', 'user3'],
  event: 'team:invitation',
  data: {
    teamId: 'team123',
    inviterName: 'John Doe',
  },
});
```

### 5. Emit đến room

```typescript
// Join room khi user tham gia quiz
// apps/quiz-service/src/modules/quiz/quiz.service.ts
async joinQuiz(userId: string, quizId: string) {
  // ... join logic ...
  
  // Emit để user join room
  this.notificationClient.emit('ws:emit:user', {
    userId,
    event: 'join:room',
    data: { room: `quiz:${quizId}` },
  });
  
  // Notify others in room
  this.notificationClient.emit('ws:emit:room', {
    room: `quiz:${quizId}`,
    event: 'user:joined',
    data: { userId, joinedAt: new Date() },
  });
}
```

## Client-side Usage

```javascript
// Connect với authentication
const socket = io('ws://localhost:3303', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

// Listen for events
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('quiz:created', (data) => {
  console.log('Quiz created:', data);
  // Update UI
});

socket.on('system:maintenance', (data) => {
  console.log('Maintenance notice:', data);
  // Show notification
});

// Send ping
socket.emit('ping', {}, (response) => {
  console.log('Pong received:', response);
});
```

## Events từ Server

- `connected` - Khi client connect thành công
- `pong` - Response cho ping

## Các patterns có sẵn

- `ws:emit:user` - Emit đến 1 user
- `ws:emit:users` - Emit đến nhiều users
- `ws:broadcast` - Broadcast đến tất cả
- `ws:emit:room` - Emit đến room

## Scaling

WebSocket server sử dụng Redis Adapter để có thể scale horizontally. Multiple instances có thể broadcast events cho nhau thông qua Redis Pub/Sub.

