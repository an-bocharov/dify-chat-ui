import { useState, useRef, useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import ReactDOM from 'react-dom'
import './App.css'
import { config } from './config'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  files?: File[]
}

interface Bot {
  id: string
  name: string
  apiKey: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  botId: string
}

interface DifyError {
  message: string
  code?: string
}

interface LogEntry {
  type: 'request' | 'response' | 'error'
  timestamp: number
  data: any
}

const UserIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 16-4 16 0"/></svg>
)
const BotIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="8" width="16" height="10" rx="4"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="14" r="1.5"/></svg>
)
const ClipIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20"><path d="M7 13.5V6.75A2.75 2.75 0 0 1 9.75 4h0A2.75 2.75 0 0 1 12.5 6.75v7a3.75 3.75 0 0 1-7.5 0v-7A5.25 5.25 0 0 1 15.25 6.75v7"/></svg>
)
const SunIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
)
const MoonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
)
const SendIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
)
const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
)
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
)
const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
)
const RegenerateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
)
const ConsoleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/>
    <polyline points="6,10 10,14 6,18" stroke="currentColor" strokeWidth="2" fill="none"/>
    <line x1="13" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

function ChatMenuPortal({ anchorRef, onDelete, onClose }: { anchorRef: React.RefObject<HTMLElement>, onDelete: () => void, onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{top: number, left: number} | null>(null)

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + 4,
        left: rect.left
      })
    }
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [anchorRef, onClose])

  if (!pos) return null;
  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="chat-menu-dropdown"
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
    >
      <button className="chat-menu-delete" onClick={onDelete}>Удалить чат</button>
    </div>,
    document.body
  )
}

function App() {
  const [chats, setChats] = useState<Chat[]>(() => {
    const saved = localStorage.getItem('chats')
    return saved ? JSON.parse(saved) : []
  })
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    return localStorage.getItem('currentChatId') || ''
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [bots, setBots] = useState<Bot[]>(() => {
    const saved = localStorage.getItem('bots')
    return saved ? JSON.parse(saved) : [{
      id: 'default',
      name: 'Бот по умолчанию',
      apiKey: config.dify.apiKey || ''
    }]
  })
  const [showAddBot, setShowAddBot] = useState(false)
  const [newBotName, setNewBotName] = useState('')
  const [newBotKey, setNewBotKey] = useState('')
  const [selectedBotId, setSelectedBotId] = useState(() => {
    return localStorage.getItem('selectedBotId') || 'default'
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [openMenuChatId, setOpenMenuChatId] = useState<string | null>(null)
  const menuBtnRefs = useRef<{[key: string]: HTMLButtonElement | null}>({})
  const [showBots, setShowBots] = useState(false)
  const botSelectBlockRef = useRef<HTMLDivElement>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isConsoleOpen, setIsConsoleOpen] = useState(true)

  useEffect(() => {
    if (chats.length === 0) {
      createNewChat()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    localStorage.setItem('currentChatId', currentChatId)
  }, [currentChatId])

  useEffect(() => {
    localStorage.setItem('bots', JSON.stringify(bots))
  }, [bots])

  useEffect(() => {
    localStorage.setItem('selectedBotId', selectedBotId)
  }, [selectedBotId])

  useEffect(() => {
    if (!showBots) return
    const handleClick = (e: MouseEvent) => {
      if (botSelectBlockRef.current && !botSelectBlockRef.current.contains(e.target as Node)) {
        setShowBots(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showBots])

  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev)
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
      messages: [],
      botId: selectedBotId
    }
    setChats(prev => [...prev, newChat])
    setCurrentChatId(newChat.id)
  }

  const currentChat = chats.find(chat => chat.id === currentChatId)
  const currentBot = bots.find(bot => bot.id === (currentChat?.botId || selectedBotId))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && attachedFiles.length === 0) || !currentChat) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      files: attachedFiles
    }

    if (currentChat.messages.length === 0) {
      const firstWords = input.trim().split(/\s+/).slice(0, 8).join(' ')
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, title: firstWords || 'Новый чат', messages: [...chat.messages, userMessage] }
          : chat
      ))
    } else {
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      ))
    }
    setInput('')
    setAttachedFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = '60px'
    }
    setIsLoading(true)

    try {
      if (!config.dify.apiEndpoint || !currentBot?.apiKey) {
        throw new Error('API configuration is missing')
      }

      const fileInfo = attachedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))

      const messages = [...currentChat.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const requestBody: any = {
        inputs: {},
        query: input,
        response_mode: "blocking",
        user: "user-123",
        files: fileInfo,
        messages: messages
      }
      if ((currentChat as any).conversation_id) {
        requestBody.conversation_id = (currentChat as any).conversation_id
      }

      setLogs(prev => [...prev, { type: 'request', timestamp: Date.now(), data: requestBody }])

      const response = await axios.post(config.dify.apiEndpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${currentBot.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      setLogs(prev => [...prev, { type: 'response', timestamp: Date.now(), data: response.data }])

      const botMessage: Message = {
        role: 'assistant',
        content: response.data.answer || response.data.message || response.data.text
      }

      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, botMessage] }
          : chat
      ))
    } catch (error) {
      const axiosError = error as AxiosError<DifyError>
      setLogs(prev => [...prev, { type: 'error', timestamp: Date.now(), data: axiosError }])
      console.error('Error details:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      })
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `Ошибка: ${axiosError.response?.data?.message || axiosError.message || 'Неизвестная ошибка'}`
      }

      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleAddBot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBotName.trim() || !newBotKey.trim()) return
    const newBot: Bot = {
      id: Date.now().toString(),
      name: newBotName,
      apiKey: newBotKey
    }
    setBots(prev => [...prev, newBot])
    setNewBotName('')
    setNewBotKey('')
    setShowAddBot(false)
    setSelectedBotId(newBot.id)
  }

  const handleDeleteChat = (chatId: string) => {
    setChats(prev => {
      const filtered = prev.filter(chat => chat.id !== chatId)
      if (currentChatId === chatId && filtered.length > 0) {
        setCurrentChatId(filtered[0].id)
      } else if (filtered.length === 0) {
        setCurrentChatId('')
      }
      return filtered
    })
  }

  const handleDeleteBot = (botId: string) => {
    setBots(prev => prev.filter(bot => bot.id !== botId))
    if (selectedBotId === botId) {
      setSelectedBotId('default')
    }
  }

  const handleSelectBot = (botId: string) => {
    setSelectedBotId(botId)
    setShowBots(false)
    createNewChatWithBot(botId)
  }

  const createNewChatWithBot = (botId: string) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
      messages: [],
      botId
    }
    setChats(prev => [...prev, newChat])
    setCurrentChatId(newChat.id)
  }

  const regenerateResponse = async (messageIndex: number) => {
    if (!currentChat) return
    const updatedMessages = currentChat.messages.slice(0, messageIndex + 1)
    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: updatedMessages }
        : chat
    ))
    setIsLoading(true)
    try {
      if (!config.dify.apiEndpoint || !currentBot?.apiKey) {
        throw new Error('API configuration is missing')
      }
      const messages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      const requestBody: any = {
        inputs: {},
        query: updatedMessages[messageIndex].content,
        response_mode: "blocking",
        user: "user-123",
        messages: messages
      }
      if ((currentChat as any).conversation_id) {
        requestBody.conversation_id = (currentChat as any).conversation_id
      }
      setLogs(prev => [...prev, { type: 'request', timestamp: Date.now(), data: requestBody }])
      const response = await axios.post(config.dify.apiEndpoint, requestBody, {
        headers: {
          'Authorization': `Bearer ${currentBot.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      setLogs(prev => [...prev, { type: 'response', timestamp: Date.now(), data: response.data }])
      const botMessage: Message = {
        role: 'assistant',
        content: response.data.answer || response.data.message || response.data.text
      }
      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, botMessage] }
          : chat
      ))
    } catch (error) {
      const axiosError = error as AxiosError<DifyError>
      setLogs(prev => [...prev, { type: 'error', timestamp: Date.now(), data: axiosError }])
      console.error('Error details:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      })
      
      const errorMessage: Message = {
        role: 'assistant',
        content: `Ошибка: ${axiosError.response?.data?.message || axiosError.message || 'Неизвестная ошибка'}`
      }

      setChats(prev => prev.map(chat =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, errorMessage] }
          : chat
      ))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`app-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <div className="sidebar">
        <button className="new-chat-button" onClick={createNewChat}>
          + Новый чат
        </button>
        <div className="chat-history">
          {chats.slice().reverse().map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
              onClick={() => setCurrentChatId(chat.id)}
            >
              <div style={{flex: 1, minWidth: 0}}>
                <span className="chat-title">{chat.title}</span>
                <span className="chat-bot-name">{bots.find(b => b.id === chat.botId)?.name || 'Бот'}</span>
              </div>
              <div className="chat-menu-wrapper">
                <button
                  ref={el => menuBtnRefs.current[chat.id] = el}
                  className="chat-menu-btn"
                  onClick={e => {e.stopPropagation(); setOpenMenuChatId(chat.id === openMenuChatId ? null : chat.id)}}
                >
                  <DotsIcon />
                </button>
                {openMenuChatId === chat.id && (
                  <ChatMenuPortal
                    anchorRef={{ current: menuBtnRefs.current[chat.id] }}
                    onDelete={() => { handleDeleteChat(chat.id); setOpenMenuChatId(null) }}
                    onClose={() => setOpenMenuChatId(null)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="bot-select-block" ref={botSelectBlockRef}>
          {!showBots && (
            <div className={`bot-list-toggle${selectedBotId ? ' selected' : ''}`} onClick={() => setShowBots(v => !v)}>
              <span>{bots.find(b => b.id === selectedBotId)?.name || 'Бот'}</span>
            </div>
          )}
          {showBots && (
            <div className="bot-list">
              {bots.map(bot => (
                <div
                  key={bot.id}
                  className={`bot-list-item${selectedBotId === bot.id ? ' selected' : ''}`}
                  onClick={() => handleSelectBot(bot.id)}
                >
                  <span>{bot.name}</span>
                  {bot.id !== 'default' && (
                    <button className="delete-bot-btn" onClick={e => {e.stopPropagation(); handleDeleteBot(bot.id)}}><CrossIcon /></button>
                  )}
                </div>
              ))}
            </div>
          )}
          <button className="add-bot-button" onClick={() => setShowAddBot(true)}>
            + Добавить бота
          </button>
        </div>
        {showAddBot && (
          <form className="add-bot-form" onSubmit={handleAddBot}>
            <input
              type="text"
              placeholder="Имя бота"
              value={newBotName}
              onChange={e => setNewBotName(e.target.value)}
              className="add-bot-input"
              required
            />
            <input
              type="text"
              placeholder="API-ключ"
              value={newBotKey}
              onChange={e => setNewBotKey(e.target.value)}
              className="add-bot-input"
              required
            />
            <div className="add-bot-actions">
              <button type="submit" className="add-bot-save">Сохранить</button>
              <button type="button" className="add-bot-cancel" onClick={() => setShowAddBot(false)}>Отмена</button>
            </div>
          </form>
        )}
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div className="main-content">
        <div className="chat-container">
          {currentChat?.messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="avatar">
                {message.role === 'user' ? <UserIcon /> : <BotIcon />}
              </div>
              <div className="message-content">
                <ReactMarkdown>{message.content}</ReactMarkdown>
                {message.files && message.files.length > 0 && (
                  <div className="attached-files">
                    {message.files.map((file, fileIndex) => (
                      <div key={fileIndex} className="file-item">
                        <span className="file-icon"><ClipIcon /></span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                      </div>
                    ))}
                  </div>
                )}
                {message.role === 'assistant' && index > 0 && (
                  <button
                    className="regenerate-button"
                    onClick={() => regenerateResponse(index - 1)}
                    disabled={isLoading}
                    title="Перегенерировать ответ"
                  >
                    <RegenerateIcon />
                  </button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot-message">
              <div className="avatar"><BotIcon /></div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="input-container">
          <div className="input-wrapper">
            {attachedFiles.length > 0 && (
              <div className="attached-files-preview">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="file-preview">
                    <span className="file-icon"><ClipIcon /></span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({formatFileSize(file.size)})</span>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder="Введите ваше сообщение..."
              className="message-input"
              disabled={isLoading}
              rows={1}
            />
            <div className="input-buttons">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="file-input"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="attach-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <ClipIcon />
              </button>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                className="send-button"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </form>
      </div>
      <div
        className={`console-panel${isConsoleOpen ? '' : ' console-collapsed'}`}
        onClick={!isConsoleOpen ? () => setIsConsoleOpen(true) : undefined}
        style={!isConsoleOpen ? { cursor: 'pointer' } : {}}
      >
        {!isConsoleOpen && (
          <button className="console-toggle" tabIndex={-1} aria-hidden="true" style={{ pointerEvents: 'none' }}>
            <ConsoleIcon />
          </button>
        )}
        {isConsoleOpen && (
          <>
            <div className="console-header">
              Console
              <button className="console-toggle" onClick={() => setIsConsoleOpen(false)} title="Свернуть консоль">
                <ConsoleIcon />
              </button>
            </div>
            <div className="console-body">
              {logs.length === 0 && <div className="console-empty">Нет запросов</div>}
              {logs.map((log, i) => (
                <div key={i} className={`console-log console-log-${log.type}`}>
                  <div className="console-log-meta">
                    {new Date(log.timestamp).toLocaleTimeString()} — {log.type}
                  </div>
                  <pre className="console-log-data">{JSON.stringify(log.data, null, 2)}</pre>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
