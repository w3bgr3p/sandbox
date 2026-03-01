import React, { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'

// Структура курса — замени на реальные уроки
const MODULES = [
  {
    id: 'mod-1',
    title: 'Модуль 1 — Основы',
    lessons: [
      { id: 'l-1-1', title: 'Введение в web-автоматизацию', duration: '12 мин', done: false },
      { id: 'l-1-2', title: 'Инструменты: ZennoPoster, Playwright, Puppeteer', duration: '18 мин', done: false },
      { id: 'l-1-3', title: 'Структура HTML и DOM', duration: '22 мин', done: false },
    ]
  },
  {
    id: 'mod-2',
    title: 'Модуль 2 — Поиск элементов',
    lessons: [
      { id: 'l-2-1', title: 'CSS-селекторы: полное руководство', duration: '28 мин', done: false },
      { id: 'l-2-2', title: 'XPath — когда CSS недостаточно', duration: '20 мин', done: false },
      { id: 'l-2-3', title: 'data-testid, aria-label, роли', duration: '15 мин', done: false },
    ]
  },
  {
    id: 'mod-3',
    title: 'Модуль 3 — Сложные случаи',
    lessons: [
      { id: 'l-3-1', title: 'Shadow DOM: open и closed', duration: '25 мин', done: false },
      { id: 'l-3-2', title: 'iframe и вложенные документы', duration: '18 мин', done: false },
      { id: 'l-3-3', title: 'Canvas — как работать без DOM', duration: '30 мин', done: false },
      { id: 'l-3-4', title: 'Динамический контент и ожидание', duration: '22 мин', done: false },
    ]
  },
  {
    id: 'mod-4',
    title: 'Модуль 4 — Обход защит',
    lessons: [
      { id: 'l-4-1', title: 'Fingerprinting: что отдаёт браузер', duration: '35 мин', done: false },
      { id: 'l-4-2', title: 'Bot detection: как тебя палят', duration: '40 мин', done: false },
      { id: 'l-4-3', title: 'Anti-DevTools и реакция на них', duration: '20 мин', done: false },
    ]
  },
  {
    id: 'mod-5',
    title: 'Модуль 5 — Web3',
    lessons: [
      { id: 'l-5-1', title: 'MetaMask: подключение и подпись', duration: '25 мин', done: false },
      { id: 'l-5-2', title: 'Работа с Privy и embedded wallet', duration: '30 мин', done: false },
    ]
  },
]

export default function Lessons({ access }) {
  const { user } = usePrivy()
  const [activeLesson, setActiveLesson] = useState(null)
  const [done, setDone] = useState({})

  // Guard


  const totalLessons = MODULES.reduce((a, m) => a + m.lessons.length, 0)
  const doneLessons = Object.values(done).filter(Boolean).length

  return (
    <div className="lessons-layout">

      {/* Sidebar */}
      <aside className="lessons-sidebar">
        <div className="lessons-progress-block">
          <div className="lessons-progress-label">Прогресс курса</div>
          <div className="lessons-progress-bar">
            <div className="lessons-progress-fill" style={{ width: `${(doneLessons / totalLessons) * 100}%` }} />
          </div>
          <div className="lessons-progress-count">{doneLessons} / {totalLessons}</div>
        </div>

        <nav className="lessons-nav">
          {MODULES.map(mod => (
            <div key={mod.id} className="lessons-module">
              <div className="lessons-module-title">{mod.title}</div>
              {mod.lessons.map(lesson => (
                <button
                  key={lesson.id}
                  className={`lessons-nav-item ${activeLesson?.id === lesson.id ? 'active' : ''} ${done[lesson.id] ? 'done' : ''}`}
                  onClick={() => setActiveLesson(lesson)}
                >
                  <span className="lessons-nav-check">{done[lesson.id] ? '✓' : '○'}</span>
                  <span className="lessons-nav-title">{lesson.title}</span>
                  <span className="lessons-nav-dur">{lesson.duration}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="lessons-main">
        {!activeLesson ? (
          <div className="lessons-welcome">
            <div className="lessons-welcome-icon">📚</div>
            <div className="lessons-welcome-title">Добро пожаловать в курс</div>
            <div className="lessons-welcome-sub">
              Выбери урок в меню слева чтобы начать.
            </div>
            <div className="lessons-welcome-user">
              // Авторизован как: {user?.email?.address || user?.twitter?.username || user?.id?.slice(0, 20)}
            </div>
          </div>
        ) : (
          <div className="lesson-view">
            <div className="lesson-breadcrumb">
              {MODULES.find(m => m.lessons.some(l => l.id === activeLesson.id))?.title} → {activeLesson.title}
            </div>
            <h1 className="lesson-title">{activeLesson.title}</h1>
            <div className="lesson-meta">
              <span>⏱ {activeLesson.duration}</span>
              {done[activeLesson.id] && <span className="lesson-done-badge">✓ Пройден</span>}
            </div>

            {/* Здесь будет реальный контент урока */}
            <div className="lesson-content">
              <div className="lesson-placeholder">
                <div className="lesson-placeholder-code">
                  // Урок: {activeLesson.id}
                  {'\n'}// Добавь контент в MODULES в Lessons.jsx
                  {'\n'}// Например: MDX, видео embed, интерактивные задания
                </div>
                <p>
                  Здесь будет содержимое урока <strong>{activeLesson.title}</strong>.
                  Используй любой формат: Markdown, видео, iframe с упражнением на sandbox.
                </p>

                {/* Пример: ссылка на конкретную зону sandbox для практики */}
                <div className="lesson-sandbox-link">
                  <span>// Практика →</span>
                  <a href="#forms" onClick={() => {/* можно переключить вид */}}>
                    Открыть полигон для этого урока
                  </a>
                </div>
              </div>
            </div>

            <div className="lesson-footer">
              <button
                className={`btn-lesson-done ${done[activeLesson.id] ? 'is-done' : ''}`}
                onClick={() => setDone(d => ({ ...d, [activeLesson.id]: !d[activeLesson.id] }))}
              >
                {done[activeLesson.id] ? '✓ Отмечен как пройденный' : 'Отметить как пройденный'}
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  )
}
