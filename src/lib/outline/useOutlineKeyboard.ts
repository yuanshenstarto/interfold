"use client";

/**
 * Custom React hook for handling keyboard shortcuts in outline editor
 * Supports Enter, Tab, Shift+Tab, Arrow keys, Backspace
 *
 * Usage:
 * ```tsx
 * const handlers = useOutlineKeyboard({
 *   onEnter: () => createNewNode(),
 *   onTab: () => indentNode(),
 *   onShiftTab: () => outdentNode(),
 *   onArrowUp: () => moveFocusUp(),
 *   onArrowDown: () => moveFocusDown(),
 *   onArrowLeft: () => collapseNode(),
 *   onArrowRight: () => expandNode(),
 *   onBackspace: () => deleteNode(),
 * });
 *
 * return <input onKeyDown={handlers.handleKeyDown} />;
 * ```
 */

import { useCallback, useEffect, type KeyboardEvent } from "react";

export interface OutlineKeyboardHandlers {
  /** Enter: Create new sibling node */
  onEnter?: (event: KeyboardEvent) => void | Promise<void>;

  /** Tab: Indent node (make it a child of previous sibling) */
  onTab?: (event: KeyboardEvent) => void | Promise<void>;

  /** Shift+Tab: Outdent node (make it a sibling of parent) */
  onShiftTab?: (event: KeyboardEvent) => void | Promise<void>;

  /** Arrow Up: Move focus to previous node */
  onArrowUp?: (event: KeyboardEvent) => void | Promise<void>;

  /** Arrow Down: Move focus to next node */
  onArrowDown?: (event: KeyboardEvent) => void | Promise<void>;

  /** Arrow Left: Collapse node (hide children) */
  onArrowLeft?: (event: KeyboardEvent) => void | Promise<void>;

  /** Arrow Right: Expand node (show children) */
  onArrowRight?: (event: KeyboardEvent) => void | Promise<void>;

  /** Backspace: Delete empty node or merge with previous */
  onBackspace?: (event: KeyboardEvent) => void | Promise<void>;

  /** Escape: Blur/unfocus current node */
  onEscape?: (event: KeyboardEvent) => void | Promise<void>;
}

export interface UseOutlineKeyboardOptions extends OutlineKeyboardHandlers {
  /** Disable all keyboard shortcuts */
  disabled?: boolean;

  /** Custom key event filter (return false to ignore event) */
  shouldHandle?: (event: KeyboardEvent) => boolean;
}

export interface UseOutlineKeyboardReturn {
  /** Attach to input/textarea onKeyDown */
  handleKeyDown: (event: KeyboardEvent) => void;

  /** Manually trigger a specific handler */
  trigger: (key: keyof OutlineKeyboardHandlers, event?: KeyboardEvent) => void;
}

/**
 * Custom hook for outline keyboard navigation
 */
export function useOutlineKeyboard(
  options: UseOutlineKeyboardOptions
): UseOutlineKeyboardReturn {
  const {
    onEnter,
    onTab,
    onShiftTab,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onBackspace,
    onEscape,
    disabled = false,
    shouldHandle,
  } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Early exit if disabled
      if (disabled) {
        return;
      }

      // Custom filter
      if (shouldHandle && !shouldHandle(event)) {
        return;
      }

      const key = event.key;
      const shiftKey = event.shiftKey;
      const ctrlKey = event.ctrlKey || event.metaKey;

      // Ignore if modifier keys are pressed (except Shift for Shift+Tab)
      if (ctrlKey) {
        return;
      }

      // Handle each key
      switch (key) {
        case "Enter":
          if (onEnter) {
            event.preventDefault();
            void onEnter(event);
          }
          break;

        case "Tab":
          event.preventDefault(); // Always prevent default Tab behavior
          if (shiftKey && onShiftTab) {
            void onShiftTab(event);
          } else if (!shiftKey && onTab) {
            void onTab(event);
          }
          break;

        case "ArrowUp":
          if (onArrowUp) {
            event.preventDefault();
            void onArrowUp(event);
          }
          break;

        case "ArrowDown":
          if (onArrowDown) {
            event.preventDefault();
            void onArrowDown(event);
          }
          break;

        case "ArrowLeft":
          if (onArrowLeft) {
            // Only prevent default if handler exists
            // This allows cursor movement in input if no handler
            const target = event.target as HTMLInputElement;
            const cursorAtStart = target.selectionStart === 0;

            if (cursorAtStart) {
              event.preventDefault();
              void onArrowLeft(event);
            }
          }
          break;

        case "ArrowRight":
          if (onArrowRight) {
            const target = event.target as HTMLInputElement;
            const cursorAtEnd = target.selectionStart === target.value.length;

            if (cursorAtEnd) {
              event.preventDefault();
              void onArrowRight(event);
            }
          }
          break;

        case "Backspace":
          if (onBackspace) {
            const target = event.target as HTMLInputElement;
            const isEmpty = target.value.length === 0;

            if (isEmpty) {
              event.preventDefault();
              void onBackspace(event);
            }
          }
          break;

        case "Escape":
          if (onEscape) {
            event.preventDefault();
            void onEscape(event);
          }
          break;

        default:
          // Unhandled key
          break;
      }
    },
    [
      disabled,
      shouldHandle,
      onEnter,
      onTab,
      onShiftTab,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onBackspace,
      onEscape,
    ]
  );

  const trigger = useCallback(
    (key: keyof OutlineKeyboardHandlers, event?: KeyboardEvent) => {
      const handler = options[key];
      if (handler && event) {
        void handler(event);
      }
    },
    [options]
  );

  return {
    handleKeyDown,
    trigger,
  };
}

/**
 * Hook for global keyboard shortcuts (attach to document)
 * Useful for shortcuts that should work even when no input is focused
 *
 * Usage:
 * ```tsx
 * useGlobalOutlineKeyboard({
 *   onCtrlEnter: () => saveDocument(),
 *   onCtrlS: () => saveDocument(),
 * });
 * ```
 */
export interface GlobalKeyboardHandlers {
  onCtrlEnter?: () => void | Promise<void>;
  onCtrlS?: () => void | Promise<void>;
  onCtrlZ?: () => void | Promise<void>;
  onCtrlShiftZ?: () => void | Promise<void>;
}

export function useGlobalOutlineKeyboard(handlers: GlobalKeyboardHandlers) {
  useEffect(() => {
    function handleGlobalKeyDown(event: Event) {
      const kbEvent = event as unknown as globalThis.KeyboardEvent;
      const key = kbEvent.key;
      const ctrlKey = kbEvent.ctrlKey || kbEvent.metaKey;
      const shiftKey = kbEvent.shiftKey;

      if (!ctrlKey) {
        return;
      }

      if (key === "Enter" && handlers.onCtrlEnter) {
        kbEvent.preventDefault();
        void handlers.onCtrlEnter();
      } else if (key === "s" && handlers.onCtrlS) {
        kbEvent.preventDefault();
        void handlers.onCtrlS();
      } else if (key === "z" && !shiftKey && handlers.onCtrlZ) {
        kbEvent.preventDefault();
        void handlers.onCtrlZ();
      } else if (key === "z" && shiftKey && handlers.onCtrlShiftZ) {
        kbEvent.preventDefault();
        void handlers.onCtrlShiftZ();
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handlers]);
}
