'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, Heading2, List, ListOrdered,
    CheckSquare, Highlighter, Undo2, Redo2, Minus
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: string;
}

const ToolbarButton = ({ onClick, isActive, children, title }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        aria-pressed={isActive}
        className={`p-1.5 rounded-lg transition-colors ${isActive
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
    >
        {children}
    </button>
);

const HIGHLIGHT_COLORS = [
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Green', color: '#bbf7d0' },
    { name: 'Blue', color: '#bfdbfe' },
    { name: 'Pink', color: '#fbcfe8' },
    { name: 'Orange', color: '#FFB3A7' },
    { name: 'Purple', color: '#ddd6fe' },
];

const HighlightColorPicker = ({ editor }: { editor: any }) => {
    const [open, setOpen] = useState(false);
    const isActive = editor.isActive('highlight');

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                title="Highlight"
                aria-label="Highlight"
                aria-expanded={open}
                aria-haspopup="true"
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
            >
                <Highlighter className="w-4 h-4" />
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-card border border-border/50 rounded-xl shadow-xl z-50 flex items-center gap-1.5">
                    {HIGHLIGHT_COLORS.map(({ name, color }) => (
                        <button
                            key={name}
                            type="button"
                            title={name}
                            aria-label={`Highlight ${name}`}
                            onClick={() => {
                                editor.chain().focus().toggleHighlight({ color }).run();
                                setOpen(false);
                            }}
                            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-125"
                            style={{
                                backgroundColor: color,
                                borderColor: editor.isActive('highlight', { color }) ? 'var(--primary, #2E7D7F)' : 'transparent',
                            }}
                        />
                    ))}
                    {/* Remove highlight */}
                    <button
                        type="button"
                        title="Remove Highlight"
                        aria-label="Remove highlight"
                        onClick={() => {
                            editor.chain().focus().unsetHighlight().run();
                            setOpen(false);
                        }}
                        className="w-6 h-6 rounded-full border-2 border-border/50 flex items-center justify-center text-muted-foreground hover:scale-125 transition-transform text-xs"
                    >
                        âœ•
                    </button>
                </div>
            )}
        </div>
    );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder, minHeight = '400px' }) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                bulletList: { keepMarks: true },
                orderedList: { keepMarks: true },
            }),
            Highlight.configure({ multicolor: true }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Placeholder.configure({
                placeholder: placeholder || 'Start writing...',
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm max-w-none focus:outline-none p-4 text-foreground custom-editor-height`,
                'aria-label': placeholder || 'Rich text editor',
            },
        },
    });

    if (!editor) return null;

    return (
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border/50 bg-muted/20 flex-wrap">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Heading"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-border/50 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleTaskList().run()}
                    isActive={editor.isActive('taskList')}
                    title="Checkbox List"
                >
                    <CheckSquare className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-border/50 mx-1" />

                <HighlightColorPicker editor={editor} />
                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Divider"
                >
                    <Minus className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-5 bg-border/50 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo2 className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* Editor */}
            <EditorContent editor={editor} />

            {/* Styles */}
            <style jsx global>{`
                .tiptap {
                    min-height: ${minHeight};
                    max-height: ${minHeight};
                    overflow-y: auto;
                    padding: 1rem;
                    font-size: 0.875rem;
                    line-height: 1.6;
                    color: inherit;
                }
                .tiptap:focus {
                    outline: none;
                }
                .tiptap p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: var(--muted-foreground, #9ca3af);
                    pointer-events: none;
                    height: 0;
                    opacity: 0.5;
                }
                .tiptap h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 0.75rem 0 0.25rem;
                }
                .tiptap h3 {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin: 0.5rem 0 0.25rem;
                }
                .tiptap ul, .tiptap ol {
                    padding-left: 1.25rem;
                    margin: 0.25rem 0;
                }
                .tiptap ul {
                    list-style: disc;
                }
                .tiptap ol {
                    list-style: decimal;
                }
                .tiptap li {
                    margin: 0.15rem 0;
                }
                .tiptap mark {
                    border-radius: 0.125rem;
                    padding: 0 0.125rem;
                    box-decoration-break: clone;
                }
                .tiptap hr {
                    border-color: var(--border, #e5e7eb);
                    margin: 0.75rem 0;
                    opacity: 0.5;
                }
                .tiptap ul[data-type="taskList"] {
                    list-style: none;
                    padding-left: 0;
                }
                .tiptap ul[data-type="taskList"] li {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }
                .tiptap ul[data-type="taskList"] li label {
                    margin-top: 0.15rem;
                }
                .tiptap ul[data-type="taskList"] li label input[type="checkbox"] {
                    width: 1rem;
                    height: 1rem;
                    accent-color: var(--primary, #2E7D7F);
                    cursor: pointer;
                    border-radius: 0.25rem;
                }
                .tiptap ul[data-type="taskList"] li div {
                    flex: 1;
                }
                .tiptap p {
                    margin: 0.15rem 0;
                }
                .tiptap strong {
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;

