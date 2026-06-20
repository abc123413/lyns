"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Modal } from "antd";
import { Bot, History, MessageSquarePlus, Minus, Trash2, X } from "lucide-react";

import { canvasThemes } from "@/lib/canvas-theme";
import { useThemeStore } from "@/stores/use-theme-store";
import { useUserStore } from "@/stores/use-user-store";
import { selectableModelsByCapability, useConfigStore, useEffectiveConfig, resolveModelRequestConfig, modelOptionName } from "@/stores/use-config-store";
import { AgentChatComposer, AgentChatMessage, type CanvasAgentChatMessage } from "./canvas-agent-chat-ui";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { ModelPicker } from "@/components/model-picker";
import { nanoid } from "nanoid";

type FloatingPosition = { x: number; y: number };

const COLLAPSED_SIZE = 48;
const PANEL_WIDTH = 340;
const PANEL_HEIGHT = 440;
const EDGE_MARGIN = 24;
const SNAP_DISTANCE = 12;
const SESSIONS_KEY = "lyns:floating_agent_sessions";

type ChatMessage = CanvasAgentChatMessage & { role: "user" | "assistant" | "system" | "error"; time?: number };

type AgentSession = {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
};

function loadSessions(): AgentSession[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(SESSIONS_KEY);
        return raw ? (JSON.parse(raw) as AgentSession[]) : [];
    } catch { return []; }
}

function saveSessions(sessions: AgentSession[]) {
    if (typeof window === "undefined") return;
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); } catch { /* quota */ }
}

function createSession(): AgentSession {
    return { id: nanoid(), title: "新对话", messages: [], createdAt: Date.now() };
}

type ViewTab = "chat" | "history";

export function CanvasFloatingAgent({ getCanvasSnapshot }: { getCanvasSnapshot?: () => string } = {}) {
    const theme = canvasThemes[useThemeStore((state) => state.theme)];
    const user = useUserStore((state) => state.user);
    const config = useEffectiveConfig();
    const openConfigDialog = useConfigStore((state) => state.openConfigDialog);
    const [open, setOpen] = useState(false);
    const [sessions, setSessions] = useState<AgentSession[]>(() => loadSessions());
    const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || "");
    const [view, setView] = useState<ViewTab>("chat");
    const [prompt, setPrompt] = useState("");
    const [sending, setSending] = useState(false);
    const [model, setModel] = useState(() => config.textModel || selectableModelsByCapability(config, "text")[0] || "");
    const [position, setPosition] = useState<FloatingPosition>({ x: -1, y: -1 });
    const [panelHeight, setPanelHeight] = useState(PANEL_HEIGHT);
    const [deleteSessionId, setDeleteSessionId] = useState("");
    const panelRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const dragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
    const resizeState = useRef<{ startY: number; startHeight: number } | null>(null);

    const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
    const messages = activeSession?.messages || [];
    const historySessions = sessions.filter((s) => s.messages.length > 0);

    useEffect(() => {
        if (position.x < 0) {
            setPosition({ x: window.innerWidth - PANEL_WIDTH - EDGE_MARGIN, y: window.innerHeight - COLLAPSED_SIZE - EDGE_MARGIN });
        }
    }, [position.x]);

    useEffect(() => { saveSessions(sessions); }, [sessions]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const updateActiveSession = (updater: (session: AgentSession) => AgentSession) => {
        setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? updater(s) : s)));
    };

    const newChat = () => {
        const session = createSession();
        setSessions((prev) => [session, ...prev]);
        setActiveSessionId(session.id);
        setView("chat");
    };

    const openChat = (sessionId: string) => {
        setActiveSessionId(sessionId);
        setView("chat");
    };

    const deleteSession = (sessionId: string) => {
        const next = sessions.filter((s) => s.id !== sessionId);
        setSessions(next);
        if (sessionId === activeSessionId) {
            setActiveSessionId(next[0]?.id || "");
        }
        setDeleteSessionId("");
    };

    const snapPosition = useCallback((pos: FloatingPosition): FloatingPosition => {
        const maxX = window.innerWidth - (open ? PANEL_WIDTH : COLLAPSED_SIZE);
        const maxY = window.innerHeight - (open ? panelHeight : COLLAPSED_SIZE);
        let x = Math.max(0, Math.min(pos.x, maxX));
        let y = Math.max(0, Math.min(pos.y, maxY));
        if (x < SNAP_DISTANCE) x = 0;
        if (x > maxX - SNAP_DISTANCE) x = maxX;
        if (y < SNAP_DISTANCE) y = 0;
        if (y > maxY - SNAP_DISTANCE) y = maxY;
        return { x, y };
    }, [open, panelHeight]);

    const handleDragStart = (event: React.PointerEvent) => {
        event.preventDefault();
        dragState.current = { startX: event.clientX, startY: event.clientY, startPosX: position.x, startPosY: position.y };
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    };
    const handleDragMove = (event: React.PointerEvent) => {
        if (!dragState.current) return;
        const dx = event.clientX - dragState.current.startX;
        const dy = event.clientY - dragState.current.startY;
        setPosition(snapPosition({ x: dragState.current.startPosX + dx, y: dragState.current.startPosY + dy }));
    };
    const handleDragEnd = (event: React.PointerEvent) => {
        dragState.current = null;
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    };

    const handleResizeStart = (event: React.PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();
        resizeState.current = { startY: event.clientY, startHeight: panelHeight };
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
    };
    const handleResizeMove = (event: React.PointerEvent) => {
        if (!resizeState.current) return;
        const dy = resizeState.current.startY - event.clientY;
        setPanelHeight(Math.max(300, Math.min(window.innerHeight - 100, resizeState.current.startHeight + dy)));
    };
    const handleResizeEnd = (event: React.PointerEvent) => {
        resizeState.current = null;
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    };

    const sendMessage = useCallback(async () => {
        const text = prompt.trim();
        if (!text || sending) return;
        if (!model) { openConfigDialog(true); return; }

        const userMsg: ChatMessage = { id: nanoid(), role: "user", text, time: Date.now() };

        if (!activeSessionId) {
            const session = createSession();
            setSessions((prev) => [session, ...prev]);
            setActiveSessionId(session.id);
        }

        // Add message to current session
        setSessions((prev) => {
            const sid = activeSessionId || prev[0]?.id || "";
            const title = prev.find((s) => s.id === sid)?.messages.length === 0 ? text.slice(0, 30) : undefined;
            return prev.map((s) => {
                if (s.id === sid) return { ...s, messages: [...s.messages, userMsg], ...(title ? { title } : {}) };
                return s;
            });
        });

        setPrompt("");
        setSending(true);

        try {
            const requestConfig = resolveModelRequestConfig(config, model);
            const systemPrompt = config.systemPrompt || "你是灵思画布的 AI 助手，帮助用户进行创作和操作。";
            const snapshot = getCanvasSnapshot?.() || "";
            const sessionMessages = sessions.find((s) => s.id === (activeSessionId || sessions[0]?.id))?.messages || [];
            const apiMessages = [
                { role: "system" as const, content: snapshot ? `${systemPrompt}\n\n当前画布状态:\n${snapshot}` : systemPrompt },
                ...[...sessionMessages, userMsg].filter((m) => m.role === "user" || m.role === "assistant").map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
            ];

            const response = await fetch(`${requestConfig.baseUrl.replace(/\/+$/, "")}/v1/chat/completions`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${requestConfig.apiKey}` },
                body: JSON.stringify({ model: modelOptionName(model), messages: apiMessages, stream: false }),
            });

            if (!response.ok) throw new Error(await response.text().catch(() => "请求失败"));

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content || "（无回复）";
            const assistantMsg: ChatMessage = { id: nanoid(), role: "assistant", text: reply, time: Date.now() };

            setSessions((prev) => prev.map((s) => (s.id === (activeSessionId || prev[0]?.id) ? { ...s, messages: [...s.messages, assistantMsg] } : s)));
        } catch (error) {
            const errMsg: ChatMessage = { id: nanoid(), role: "error", text: error instanceof Error ? error.message : "请求失败", time: Date.now() };
            setSessions((prev) => prev.map((s) => (s.id === (activeSessionId || prev[0]?.id) ? { ...s, messages: [...s.messages, errMsg] } : s)));
        } finally {
            setSending(false);
        }
    }, [prompt, sending, model, config, activeSessionId, sessions, openConfigDialog, getCanvasSnapshot]);

    const expandedPos = open ? snapPosition(position) : position;

    if (!open) {
        return (
            <div
                className="fixed z-[900] touch-none"
                style={{ left: position.x, top: position.y }}
                onPointerDown={(event) => {
                    event.preventDefault();
                    dragState.current = { startX: event.clientX, startY: event.clientY, startPosX: position.x, startPosY: position.y };
                    (event.target as HTMLElement).setPointerCapture(event.pointerId);
                }}
                onPointerMove={handleDragMove}
                onPointerUp={(event) => {
                    const dx = Math.abs(event.clientX - (dragState.current?.startX ?? 0));
                    const dy = Math.abs(event.clientY - (dragState.current?.startY ?? 0));
                    dragState.current = null;
                    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
                    if (dx < 4 && dy < 4) {
                        setPosition(snapPosition({ x: position.x - PANEL_WIDTH + COLLAPSED_SIZE, y: position.y - panelHeight + COLLAPSED_SIZE }));
                        setOpen(true);
                    }
                }}
            >
                <button
                    type="button"
                    className="grid size-12 place-items-center rounded-full shadow-lg transition-transform hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #A97CF8, #F38CB8, #FDCC92)" }}
                >
                    <Bot className="size-6 text-white" />
                </button>
            </div>
        );
    }

    return (
        <div
            ref={panelRef}
            className="fixed z-[900] flex flex-col overflow-hidden rounded-2xl border shadow-2xl"
            style={{
                left: expandedPos.x, top: expandedPos.y, width: PANEL_WIDTH, height: panelHeight,
                borderColor: theme.node.stroke, background: theme.node.panel, color: theme.node.text,
            }}
        >
            <div className="absolute left-0 right-0 top-0 h-1.5 cursor-n-resize" onPointerDown={handleResizeStart} onPointerMove={handleResizeMove} onPointerUp={handleResizeEnd} />

            {/* Title bar */}
            <div
                className="flex h-10 shrink-0 cursor-grab items-center justify-between border-b px-3 active:cursor-grabbing"
                style={{ borderColor: theme.node.stroke }}
                onPointerDown={handleDragStart} onPointerMove={handleDragMove} onPointerUp={handleDragEnd}
            >
                <div className="flex items-center gap-2 text-xs font-semibold">
                    <Bot className="size-4" style={{ color: "#A97CF8" }} />
                    AI 助手
                </div>
                <div className="flex items-center gap-0.5">
                    <button type="button" className="grid size-6 place-items-center rounded transition hover:opacity-70" style={{ color: theme.node.muted }} onClick={newChat} title="新对话">
                        <MessageSquarePlus className="size-3.5" />
                    </button>
                    {historySessions.length > 0 ? (
                        <button type="button" className="grid size-6 place-items-center rounded transition hover:opacity-70" style={{ color: view === "history" ? theme.node.text : theme.node.muted }} onClick={() => setView(view === "history" ? "chat" : "history")} title="历史">
                            <History className="size-3.5" />
                        </button>
                    ) : null}
                    <button type="button" className="grid size-6 place-items-center rounded transition hover:opacity-70" style={{ color: theme.node.muted }} onClick={() => setOpen(false)}>
                        <Minus className="size-3.5" />
                    </button>
                </div>
            </div>

            {view === "history" ? (
                <div className="thin-scrollbar flex-1 overflow-y-auto">
                    {historySessions.length === 0 ? (
                        <div className="flex h-full items-center justify-center py-16 text-xs" style={{ color: theme.node.muted }}>暂无历史对话</div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {historySessions.map((session) => (
                                <div key={session.id} className="flex items-center gap-2 rounded-lg px-2 py-2 transition hover:opacity-80" style={{ background: session.id === activeSessionId ? theme.node.fill : "transparent" }}>
                                    <button type="button" className="min-w-0 flex-1 text-left text-xs" onClick={() => openChat(session.id)}>
                                        <div className="truncate font-medium" style={{ color: theme.node.text }}>{session.title}</div>
                                        <div className="mt-0.5 text-[10px]" style={{ color: theme.node.muted }}>{session.messages.length} 条消息 · {new Date(session.createdAt).toLocaleDateString("zh-CN")}</div>
                                    </button>
                                    <button type="button" className="grid size-6 shrink-0 place-items-center rounded transition hover:opacity-70" style={{ color: theme.node.muted }} onClick={() => setDeleteSessionId(session.id)}>
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Model selector */}
                    <div className="shrink-0 border-b px-3 py-1.5" style={{ borderColor: theme.node.stroke }}>
                        <ModelPicker config={config} capability="text" value={model} onChange={setModel} />
                    </div>

                    {/* Messages */}
                    <div className="thin-scrollbar flex-1 overflow-y-auto px-3 py-3">
                        <div className="flex flex-col gap-4">
                            {messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                                    <div className="relative font-serif text-3xl font-bold italic tracking-normal" style={{ color: theme.node.text }}>
                                        <span>Lyns</span>
                                        <DiaTextReveal className="absolute inset-0" colors={["#A97CF8", "#F38CB8", "#FDCC92"]} textColor="transparent" duration={1.8} startOnView={false} text="Lyns" />
                                    </div>
                                    <div className="mt-2 font-serif text-sm italic tracking-wide opacity-50">One canvas, infinite ideas</div>
                                </div>
                            ) : (
                                messages.map((msg) => <AgentChatMessage key={msg.id} item={msg} theme={theme} user={user} />)
                            )}
                            {sending ? (
                                <div className="flex items-center gap-2 text-xs" style={{ color: theme.node.muted }}>
                                    <span className="inline-block size-2 animate-pulse rounded-full bg-violet-400" /> 思考中...
                                </div>
                            ) : null}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Composer */}
                    <AgentChatComposer
                        prompt={prompt}
                        disabled={!model}
                        sending={sending}
                        placeholder={model ? "输入消息..." : "请先配置文本模型"}
                        theme={theme}
                        onPromptChange={setPrompt}
                        onSubmit={sendMessage}
                    />
                </>
            )}

            {/* Delete confirmation */}
            <Modal title="删除对话" open={!!deleteSessionId} onCancel={() => setDeleteSessionId("")} onOk={() => deleteSessionId && deleteSession(deleteSessionId)} okText="删除" cancelText="取消" okButtonProps={{ danger: true }} centered>
                确定删除这条对话记录吗？
            </Modal>
        </div>
    );
}
