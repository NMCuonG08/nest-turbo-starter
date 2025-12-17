import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Quiz } from '../quiz/quiz.entity';

@Entity('categories')
@Index(['parentId'])
@Index(['isActive'])
export class QuizCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'icon_url', nullable: true })
  iconUrl?: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => QuizCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: QuizCategory;

  @OneToMany(() => QuizCategory, (category) => category.parent)
  children: QuizCategory[];

  @OneToMany(() => Quiz, (quiz) => quiz.category)
  quizzes: Quiz[];
}

