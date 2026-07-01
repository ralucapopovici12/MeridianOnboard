import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutList, GripVertical, Sparkles, Users } from 'lucide-react'
import { api } from '../api/client'
import type { Board, BoardTask } from '../api/types'
import { useCurrentEmployee } from '../context/CurrentEmployeeContext'
import { initials } from '../lib/format'
import { BoardTour } from '../components/BoardTour'

/** "InProgress" -> "inprogress", used to pick a column/status colour class. */
function statusKey(status: string): string {
  return status.toLowerCase()
}

/** The status of the column currently holding a task, or null if not found. */
function columnOf(board: Board, taskId: number): string | null {
  for (const col of board.columns) {
    if (col.tasks.some((t) => t.id === taskId)) return col.status
  }
  return null
}

/** Move a task to a new column locally (append to the end of the target column). */
function applyMove(board: Board, taskId: number, toStatus: string): Board {
  let moved: BoardTask | null = null

  const stripped = board.columns.map((col) => {
    const found = col.tasks.find((t) => t.id === taskId)
    if (found) moved = found
    return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
  })

  if (!moved) return board

  return {
    ...board,
    columns: stripped.map((col) =>
      col.status === toStatus
        ? { ...col, tasks: [...col.tasks, { ...moved!, status: toStatus }] }
        : col,
    ),
  }
}

/** The assignee's photo, pinned to the bottom-right corner of a card. */
function CardAvatar({ task }: { task: BoardTask }) {
  if (!task.assigneeAvatarUrl) {
    return (
      <span className="board-card__avatar board-card__avatar--fallback" title={task.assigneeName}>
        {initials(task.assigneeName)}
      </span>
    )
  }
  return (
    <img
      className="board-card__avatar"
      src={task.assigneeAvatarUrl}
      alt={task.assigneeName}
      title={task.assigneeName}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  )
}

export function WorkspacePage() {
  const { currentId, current } = useCurrentEmployee()

  const [board, setBoard] = useState<Board | null>(null)
  const [teamBoard, setTeamBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Drag-and-drop state.
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  // First-time guided walkthrough of the board.
  const boardRef = useRef<HTMLDivElement>(null)
  const [tourOpen, setTourOpen] = useState(false)

  const load = useCallback(() => {
    if (currentId == null) return
    let active = true
    setLoading(true)
    setError(null)
    Promise.all([api.getBoard(currentId), api.getTeamBoard(currentId)])
      .then(([bd, team]) => {
        if (!active) return
        setBoard(bd)
        setTeamBoard(team)
      })
      .catch((e: unknown) => active && setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [currentId])

  useEffect(load, [load])

  // Auto-run the walkthrough the first time this person opens a board with tickets.
  useEffect(() => {
    if (currentId == null || !board) return
    const total = board.columns.reduce((n, c) => n + c.tasks.length, 0)
    if (total === 0) return
    if (!localStorage.getItem(`meridian.boardTourSeen.${currentId}`)) {
      setTourOpen(true)
    }
  }, [board, currentId])

  const closeTour = useCallback(() => {
    if (currentId != null) {
      localStorage.setItem(`meridian.boardTourSeen.${currentId}`, '1')
    }
    setTourOpen(false)
  }, [currentId])

  const moveCard = useCallback(
    async (taskId: number, toStatus: string) => {
      if (!board) return
      if (columnOf(board, taskId) === toStatus) return // no-op: dropped in same column
      const prev = board
      setBoard(applyMove(board, taskId, toStatus))
      try {
        await api.moveBoardTask(taskId, toStatus)
      } catch {
        setBoard(prev)
      }
    },
    [board],
  )

  function handleDrop(toStatus: string) {
    if (draggingId != null) moveCard(draggingId, toStatus)
    setDraggingId(null)
    setDragOver(null)
  }

  if (loading) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading workspace…</p>
  if (error) return <p style={{ color: 'var(--err)', fontSize: 14 }}>{error}</p>
  if (!board || !current) return null

  const totalTasks = board.columns.reduce((n, c) => n + c.tasks.length, 0)
  const teamColumns = teamBoard?.columns ?? []
  const teamTasks = teamColumns.reduce((n, c) => n + c.tasks.length, 0)

  // Sample ticket title used by the walkthrough's animated "move" demo.
  const todoColumn = board.columns.find((c) => c.status === 'Todo')
  const moveSampleTitle = todoColumn?.tasks[0]?.title ?? 'Your first ticket'

  return (
    <div>
      {/* Page header */}
      <div className="page-header-row fade-up" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Workspace</h1>
          <p className="page-sub">
            Drag your tickets across the board to track progress — {current.firstName}.
          </p>
        </div>
      </div>

      {/* ===== TASK BOARD ===== */}
      <div className="task-section__label" style={{ marginBottom: 12 }}>
        <span>My Board</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          {totalTasks > 0 && (
            <button className="tour-launch" onClick={() => setTourOpen(true)}>
              <Sparkles size={12} />
              Take a tour
            </button>
          )}
          <span style={{ opacity: 0.6 }}>{totalTasks} tickets</span>
        </span>
      </div>

      {totalTasks === 0 ? (
        <div
          className="glass-card glass-card--solid glass-card--no-hover"
          style={{ padding: '48px 32px', textAlign: 'center' }}
        >
          <LayoutList className="empty-state__icon" size={34} />
          <p className="empty-state__title">No tickets on your board yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Work assigned to {current.firstName} will show up here.
          </p>
        </div>
      ) : (
        <div className="board anim-slide-up" ref={boardRef}>
          {board.columns.map((col, ci) => {
            const prevCol = board.columns[ci - 1]
            const nextCol = board.columns[ci + 1]
            return (
              <div
                key={col.status}
                data-tour-col={col.status}
                className={`board-col${dragOver === col.status ? ' board-col--drop' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (dragOver !== col.status) setDragOver(col.status)
                }}
                onDragLeave={(e) => {
                  // Only clear when leaving the column entirely, not its children.
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOver((s) => (s === col.status ? null : s))
                  }
                }}
                onDrop={() => handleDrop(col.status)}
              >
                <div className="board-col__head">
                  <span className={`board-col__dot board-col__dot--${statusKey(col.status)}`} />
                  <span className="board-col__title">{col.label}</span>
                  <span className="board-col__count">{col.tasks.length}</span>
                </div>

                <div className="board-col__body">
                  {col.tasks.length === 0 && <div className="board-col__empty">Drop here</div>}

                  {col.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`board-card${draggingId === task.id ? ' board-card--dragging' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', String(task.id))
                        setDraggingId(task.id)
                      }}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setDragOver(null)
                      }}
                    >
                      <div className="board-card__top">
                        <span className="board-card__key">
                          <GripVertical size={12} className="board-card__grip" />
                          {task.key}
                        </span>
                        <span className={`priority priority--${task.priority.toLowerCase()}`}>
                          <span className="priority__dot" />
                          {task.priority}
                        </span>
                      </div>

                      <div className="board-card__title">{task.title}</div>

                      <div className="board-card__foot">
                        {task.tag && <span className="board-label">{task.tag}</span>}

                        <div className="board-card__actions">
                          <button
                            className="board-card__move"
                            aria-label={`Move "${task.title}" to ${prevCol?.label ?? ''}`}
                            disabled={!prevCol}
                            onClick={() => prevCol && moveCard(task.id, prevCol.status)}
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <button
                            className="board-card__move"
                            aria-label={`Move "${task.title}" to ${nextCol?.label ?? ''}`}
                            disabled={!nextCol}
                            onClick={() => nextCol && moveCard(task.id, nextCol.status)}
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>

                      <CardAvatar task={task} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== TEAM BOARD — what colleagues have picked up ===== */}
      {teamTasks > 0 && (
        <>
          <div className="task-section__label" style={{ margin: '40px 0 12px' }}>
            <span>
              <Users size={13} style={{ marginRight: 6, verticalAlign: '-2px', opacity: 0.7 }} />
              Team board
            </span>
            <span style={{ opacity: 0.6 }}>who picked up what</span>
          </div>

          <div className="board anim-slide-up">
            {teamColumns.map((col) => (
              <div key={col.status} className="board-col">
                <div className="board-col__head">
                  <span className={`board-col__dot board-col__dot--${statusKey(col.status)}`} />
                  <span className="board-col__title">{col.label}</span>
                  <span className="board-col__count">{col.tasks.length}</span>
                </div>

                <div className="board-col__body">
                  {col.tasks.length === 0 && <div className="board-col__empty">—</div>}

                  {col.tasks.map((task) => (
                    <div key={task.id} className="board-card board-card--static">
                      <div className="board-card__top">
                        <span className="board-card__key">{task.key}</span>
                        <span className={`priority priority--${task.priority.toLowerCase()}`}>
                          <span className="priority__dot" />
                          {task.priority}
                        </span>
                      </div>

                      <div className="board-card__title">{task.title}</div>

                      <div className="board-card__foot">
                        {task.tag && <span className="board-label">{task.tag}</span>}
                        <span className="board-card__assignee">{task.assigneeName}</span>
                      </div>

                      <CardAvatar task={task} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tourOpen && (
        <BoardTour boardRef={boardRef} moveSampleTitle={moveSampleTitle} onClose={closeTour} />
      )}
    </div>
  )
}
