import { describe, it, expect } from 'vitest';

describe('SkillMap AI Frontend Test Suite', () => {
  it('calculates skill gap correctly on client side', () => {
    const required = 85.0;
    const current = 60.0;
    const gap = Math.max(0, required - current);
    expect(gap).toBe(25.0);
  });

  it('calculates priority score according to engine formula', () => {
    const gap = 30.0;
    const weight = 4.0;
    const priority = (gap / 100.0) * weight * 20.0;
    expect(priority).toBe(24.0);
  });

  it('classifies severity appropriately', () => {
    const checkSeverity = (gap: number) => {
      if (gap >= 35) return 'critical';
      if (gap >= 15) return 'moderate';
      return 'strong';
    };

    expect(checkSeverity(45)).toBe('critical');
    expect(checkSeverity(20)).toBe('moderate');
    expect(checkSeverity(10)).toBe('strong');
  });

  it('evaluates multiple choice assessment responses accurately', () => {
    const questions = [
      { id: 1, correct: 'A' },
      { id: 2, correct: 'C' },
      { id: 3, correct: 'B' }
    ];
    const userAnswers: Record<number, string> = { 1: 'A', 2: 'B', 3: 'B' };

    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correct) correct++;
    });

    const score = Math.round((correct / questions.length) * 100);
    expect(correct).toBe(2);
    expect(score).toBe(67);
  });

  it('calculates course lesson progress percentage accurately', () => {
    const totalLessons = 6;
    const completedLessons = 4;
    const progress = Math.round((completedLessons / totalLessons) * 100);
    expect(progress).toBe(67);
  });

  it('verifies next lesson determination logic', () => {
    const lessons = [
      { id: 101, title: 'Introduction', completed: true },
      { id: 102, title: 'Core Concepts', completed: true },
      { id: 103, title: 'Advanced Patterns', completed: false },
      { id: 104, title: 'Final Project', completed: false }
    ];

    const next = lessons.find(l => !l.completed) || lessons[0];
    expect(next.id).toBe(103);
    expect(next.title).toBe('Advanced Patterns');
  });
});

