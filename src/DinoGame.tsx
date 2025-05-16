import React, { useEffect, useRef, useState } from 'react';
import './DinoGame.css';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 100;
const DINO_WIDTH = 40;
const DINO_HEIGHT = 40;
const CACTUS_WIDTH = 20;
const CACTUS_HEIGHT = 40;
const GROUND_Y = 0;
const JUMP_HEIGHT = 60;
const JUMP_DURATION = 700;
const CACTUS_SPEED = 4;
const CACTUS_HITBOX_REDUCE = 6;

function getRandomCactusX() {
  return GAME_WIDTH + Math.random() * 200;
}

interface DinoGameProps {
  isDark?: boolean;
}

export default function DinoGame({ isDark }: DinoGameProps) {
  const [dinoY, setDinoY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [cactusX, setCactusX] = useState(getRandomCactusX());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef(0);

  // Цвета для тем
  const bgColor = isDark ? '#23242a' : '#f7f7f8';
  const borderColor = isDark ? '#444' : '#bbb';
  const dinoColor = isDark ? '#ececf1' : '#222';
  const dinoEye = isDark ? '#23242a' : '#fff';
  const cactusColor = isDark ? '#7fffd4' : '#388e3c';
  const groundColor = isDark ? '#444' : '#bbb';
  const textColor = isDark ? '#ececf1' : '#222';
  const overlayColor = 'transparent';
  const hintColor = isDark ? '#aaa' : '#888';

  // Прыжок
  const jump = () => {
    if (isJumping || gameOver) return;
    setIsJumping(true);
    const start = Date.now();
    const animateJump = () => {
      const elapsed = Date.now() - start;
      if (elapsed < JUMP_DURATION / 2) {
        setDinoY(JUMP_HEIGHT * (elapsed / (JUMP_DURATION / 2)));
        requestRef.current = requestAnimationFrame(animateJump);
      } else if (elapsed < JUMP_DURATION) {
        setDinoY(JUMP_HEIGHT * (1 - (elapsed - JUMP_DURATION / 2) / (JUMP_DURATION / 2)));
        requestRef.current = requestAnimationFrame(animateJump);
      } else {
        setDinoY(0);
        setIsJumping(false);
      }
    };
    animateJump();
  };

  // Движение кактуса и столкновение
  useEffect(() => {
    if (gameOver) return;
    let animationId: number;
    const move = () => {
      setCactusX(prev => {
        let next = prev - CACTUS_SPEED;
        if (next < -CACTUS_WIDTH) {
          setScore(s => s + 1);
          next = getRandomCactusX();
        }
        // Проверка столкновения
        if (
          next < DINO_WIDTH - CACTUS_HITBOX_REDUCE &&
          next + CACTUS_WIDTH - CACTUS_HITBOX_REDUCE > 0 &&
          dinoY < CACTUS_HEIGHT - CACTUS_HITBOX_REDUCE
        ) {
          setGameOver(true);
        }
        return next;
      });
      animationId = requestAnimationFrame(move);
    };
    animationId = requestAnimationFrame(move);
    return () => cancelAnimationFrame(animationId);
  }, [dinoY, gameOver]);

  // Клавиатурное управление
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (gameOver && (e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault();
        restart();
      }
    };
    window.addEventListener('keydown', handleKey, { passive: false });
    return () => window.removeEventListener('keydown', handleKey);
  });

  const restart = () => {
    setScore(0);
    setGameOver(false);
    setCactusX(getRandomCactusX());
    setDinoY(0);
    setIsJumping(false);
  };

  return (
    <div className="dino-game-container">
      <div
        className="dino-game-canvas"
        style={{ width: '100%', height: GAME_HEIGHT, background: 'transparent', border: 'none', position: 'relative' }}
      >
        <div
          className="dino"
          style={{ left: 20, bottom: 0, width: DINO_WIDTH, height: DINO_HEIGHT, transform: `translateY(-${dinoY}px)` }}
        >
          <svg width={DINO_WIDTH} height={DINO_HEIGHT} viewBox="0 0 40 40">
            <rect x="8" y="8" width="24" height="24" rx="6" fill={dinoColor} />
            <rect x="12" y="28" width="6" height="8" rx="2" fill={dinoColor} />
            <rect x="22" y="28" width="6" height="8" rx="2" fill={dinoColor} />
            <circle cx="16" cy="18" r="2" fill={dinoEye} />
          </svg>
        </div>
        <div
          className="cactus"
          style={{ left: `calc(${cactusX / GAME_WIDTH * 100}% )`, bottom: 0, width: CACTUS_WIDTH, height: CACTUS_HEIGHT, position: 'absolute' }}
        >
          <svg width={CACTUS_WIDTH} height={CACTUS_HEIGHT} viewBox="0 0 20 40">
            <polygon points="10,0 20,40 0,40" fill={cactusColor} />
          </svg>
        </div>
        <div className="ground" style={{ bottom: 0, left: 0, width: '100%', background: groundColor, position: 'absolute', height: '4px' }} />
        <div className="score" style={{ color: textColor }}>{score}</div>
        {gameOver && (
          <div className="game-over" style={{ background: overlayColor, color: textColor }}>
            <div>Человек проиграл. Модель дообучилась.</div>
            <div className="restart-hint" style={{ color: hintColor }}>Нажмите Space или Enter для рестарта</div>
          </div>
        )}
      </div>
    </div>
  );
} 