import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DifficultyLevel, QuizType } from './quiz.enum';
import { BaseEntity } from '../base.entity';
import { QuizCategory } from '../quiz-category/quiz-category.entity';

@Entity('quizzes')
@Index(['categoryId'])
@Index(['creatorId'])
@Index(['isActive'])
@Index(['quizType'])
@Index(['publishedAt'])
export class Quiz extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'creator_id', type: 'uuid' })
  creatorId: string;

  @Column({
    name: 'difficulty_level',
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.MEDIUM,
  })
  difficultyLevel: DifficultyLevel;

  @Column({ name: 'time_limit', type: 'int', nullable: true })
  timeLimit?: number; // seconds

  @Column({ name: 'max_attempts', type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ name: 'passing_score', type: 'float', default: 70.0 })
  passingScore: number;

  @Column({ name: 'is_public', type: 'boolean', default: true })
  isPublic: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    name: 'quiz_type',
    type: 'enum',
    enum: QuizType,
    default: QuizType.PRACTICE,
  })
  quizType: QuizType;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ name: 'thumbnail_id', type: 'uuid', nullable: true })
  thumbnailId?: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  // Rating fields
  @Column({ name: 'average_rating', type: 'float', default: 0.0 })
  averageRating: number;

  @Column({ name: 'total_ratings', type: 'int', default: 0 })
  totalRatings: number;

  @Column({ name: 'published_at', type: 'timestamp with time zone', nullable: true })
  publishedAt?: Date;

  // Relations
  @ManyToOne(() => QuizCategory, (category) => category.quizzes)
  @JoinColumn({ name: 'category_id' })
  category: QuizCategory;

  // Note: User relation would be handled via microservice or separate entity
  // @ManyToOne(() => User, (user) => user.quizzes)
  // @JoinColumn({ name: 'creator_id' })
  // creator: User;

  // Note: Image relation would be handled via microservice or separate entity
  // @ManyToOne(() => Image, { nullable: true })
  // @JoinColumn({ name: 'thumbnail_id' })
  // thumbnail?: Image;
}
